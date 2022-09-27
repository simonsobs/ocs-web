"""Mock agent for ocs-web development.

Parses a yaml file and instantiates an OCS agent with a user-specified
agent class; the list of operations and their session.data blocks can
also be configured.

The mocked agent is useful for developing ocs-web panels when the real
target Agent can't be run.

Run it like::

  python agent.py --schema-file mock-whatever-agent.yaml --instance-id my-mock-whatever

You need an OCS instance running of course ... but you should not need
a site config entry for the instance.

"""
from ocs import ocs_agent, site_config
from twisted.internet.defer import inlineCallbacks
from autobahn.twisted.util import sleep as dsleep

import os
import time
import txaio
import yaml


# For logging
txaio.use_twisted()
LOG = txaio.make_logger()

class MockingJaygent:
    def __init__(self, agent):
        self.agent = agent
        self.log = agent.log

    @inlineCallbacks
    def _start_proc(self, op_name, op_params,
                    session, params):
        session.set_status('running')
        self.log.info('Process "{op_name}" started with params: {params}', op_name=op_name, params=params)

        op_data = op_params.get('data')

        while session.status == 'running':
            if op_data:
                op_data['last_update'] = time.time()
                session.data.update(op_data)
            yield dsleep(1)

        return True, f'Process {op_name} exited cleanly.'

    def _stop_proc(self, session, params):
        if session.status == 'running':
            session.set_status('stopping')

    @inlineCallbacks
    def _start_task(self, op_name, op_params, session, params):
        session.set_status('running')

        self.log.info('Task "{op_name}" started with params: {params}', op_name=op_name, params=params)

        exit_time = time.time() + op_params.get('run_time', 5)
        op_data = op_params.get('data')

        while session.status == 'running':
            if op_data:
                op_data['last_update'] = time.time()
                session.data.update(op_data)
            if time.time() >= exit_time:
                return True, f'Task {op_name} exited at the appropriate time.'
            yield dsleep(1)

        return False, f'Task {op_name} was aborted.'

    def _abort_task(self, session, params):
        if session.status == 'running':
            session.set_status('stopping')

def add_agent_args(parser_in=None):
    if parser_in is None:
        from argparse import ArgumentParser as A
        parser_in = A()
    pgroup = parser_in.add_argument_group('Agent Options')
    pgroup.add_argument("--schema-file",
                        help='YAML file with description of operations '
                        'to mock')
    return parser_in

def wrap_starter(instance, name, cfg, start_proc):
    def _f(self, session, params):
        return start_proc(name, cfg,
                          session, params)
    # Bind the function to instance...
    func = _f.__get__(instance, instance.__class__)
    setattr(instance, proc_name, func)
    return func
    

if __name__ == '__main__':
    txaio.start_logging(level=os.environ.get("LOGLEVEL", "info"))

    parser = add_agent_args()
    args = site_config.parse_args(agent_class='*host*', parser=parser)

    schema = yaml.safe_load(open(args.schema_file, 'rb'))
    args.agent_class = schema['agent_class']
    if args.instance_id is None:
        args.instance_id = schema['instance_id']
        
    agent, runner = ocs_agent.init_site_agent(args)
    mocker = MockingJaygent(agent)

    for proc_name, cfg in schema.get('processes', {}).items():
        func = wrap_starter(mocker, proc_name, cfg, mocker._start_proc)
        agent.register_process(proc_name, func, mocker._stop_proc,
                               blocking=False)

    for task_name, cfg in schema.get('tasks', {}).items():
        func = wrap_starter(mocker, task_name, cfg, mocker._start_task)
        agent.register_task(task_name, func,
                            # abort_func=mocker._abort_task,
                            blocking=False)

    runner.run(agent, auto_reconnect=True)
