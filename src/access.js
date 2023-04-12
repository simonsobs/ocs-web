// -*- mode: js -*-

/*
 * Access Control system -- password management
 *
 * In this implementation, special passwords can be set on a
 * per-instance or per-class basis, along with a default password.
 * (This means there isn't really support for level 1 / 2 / 3 access.)
 * In the UI the user will either operate as the basic user (so no
 * password will be provided), or as an escalated user (a password
 * will be provided).
 *
 */

export function PasswordManager()
{
    this.escalation = 0;
    this.passwords = {
        global: '',
        by_class: {},
        by_instance: {'faker4': 'x'},
    }
}

PasswordManager.prototype = {
    get_pass: function(agent_class, instance_id) {
        if (this.escalation == 0)
            return '';
        if (this.passwords.by_instance[instance_id])
            return this.passwords.by_instance[instance_id];
        if (this.passwords.by_class[agent_class])
            return this.passwords.by_class[agent_class];
        return this.passwords.global;
    },
    update_pass: function(agent_info, target, pws) {
        let [agent_class, instance_id] = [agent_info.agent_class, agent_info.instance_id];
        switch(target) {
        case "global":
            delete this.passwords.by_class[agent_class];
            delete this.passwords.by_instance[instance_id];
            this.passwords.global = pws['global'];
            break;
        case "class":
            delete this.passwords.by_instance[instance_id];
            this.passwords.by_class[agent_class] = pws['class']
            break;
        case "instance":
            this.passwords.by_instance[instance_id] = pws['instance'];
            break;
        }
    },
    get_view: function(agent_info) {
        let target = 'global';
        if (this.passwords.by_class[agent_info.agent_class])
            target = 'class';
        if (this.passwords.by_instance[agent_info.instance_id])
            target = 'instance';

        return {
            'target': target,
            'global': this.passwords.global,
            'class': this.passwords.by_class[agent_info.agent_class],
            'instance': this.passwords.by_instance[agent_info.instance_id],
        }
    },
}
