import {
    readdirRecursiveSync,
    isDisabled,
    isJsFile,
    requireES,
} from '../util/fs';

import { defaults, EventFile } from '../options/Event';
import { merge, has } from '../util/options';

import type { JellyCommands } from './JellyCommands';
import type { Client, ClientEvents } from 'discord.js';

export class EventManager {
    private client: Client;
    private jelly: JellyCommands;

    private events = new Map<string, EventFile[]>();

    constructor(jelly: JellyCommands) {
        this.jelly = jelly;
        this.client = jelly.client;
    }

    private add(name: string, data: EventFile) {
        this.events.set(name, [...(this.events.get(name) || []), data]);

        const cb = (...ctx: any[]) =>
            data.run(...ctx, { client: this.client, jelly: this.jelly });

        if (data.once) this.client.once(name, cb);
        else this.client.on(name, cb);
    }

    load(path: string) {
        const paths = readdirRecursiveSync(path)
            .filter((p) => isJsFile(p) && !isDisabled(p))
            .map((path) => ({ path, data: requireES(path) }));

        for (const { data } of paths) {
            const options = merge<EventFile>(defaults, data);
            if (options.disabled == true) continue;

            const hasRequired = has(data, ['name', 'run']);
            if (!hasRequired) continue;

            this.add(data.name, data);
        }
    }
}

export const createEvent = <K extends keyof ClientEvents>(
    name: K,
    data: {
        once?: boolean;
        disabled?: boolean;
        run: (
            instance: { client: Client; jelly: JellyCommands },
            ...args: ClientEvents[K]
        ) => void | any;
    },
) => ({ name, ...data });
