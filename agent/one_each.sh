#!/bin/bash
#
# Launch a mock agent for every .yaml in this directory; kill them all
# on ctrl-c.
#

trap "kill 0" EXIT

for x in *.yaml; do
    python agent.py --schema $x &
done

wait
