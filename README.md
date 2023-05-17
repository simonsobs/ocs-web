# ocs-web

[![build](https://img.shields.io/github/actions/workflow/status/simonsobs/ocs-web/build.yaml?branch=main)](https://github.com/simonsobs/ocs-web/actions/workflows/build.yaml)

## Background

This is browser-based control panel system for
[OCS](https://github.com/simonsobs/ocs), written in Vue 3.

## Project setup

Run this to fetch all dependencies into the project `node_modules`
directory:

```
$ npm install
```

## Development

### Compiles and hot-reloads for development

```
npm run serve
```

This will run [vue-cli-service
serve](https://cli.vuejs.org/guide/cli-service.html#vue-cli-service-serve)
under the hood, and you can pass additional arguments to that if you
protect them with `--`.  For example:

```
npm run serve -- --port 8888 --mode production
```

### Compiles and minifies for production

To compile for production into the `dist/` directory:

```
npm run build
```

### Lints and fixes files

```
npm run lint
```

### Customize Vue configuration
See [Configuration Reference](https://cli.vuejs.org/config/).


## Configuration

There are two ways to configure pre-set crossbar server connections, which
users can then select in the ocs-web interface. These configurations are not
strictly required, since there is always a "custom" field, which users can enter
connection details into. In practice, they are quite useful.

### config.json

You can setup OCS configs by editing `public/config.json`, prior to
build. After build, you can alter `dist/config.json`.

In the nginx docker image, you can mount a `config.json` to
`/app/dist/config.json`.

The schema for config.json is like this::

```
{"crossbars": [
    {"name": "ocs-8001",
     "url": "ws://localhost:8001/ws",
     "realm": "test_realm",
     "addr_root": "observatory"},
    {"name": "ocs-8002",
     "url": "ws://localhost:8002/ws",
     "realm": "test_realm",
     "addr_root": "platform2"}
    ]
}
```

Note that `realm` and `addr_root` are optional, and will default to
values `test_realm` and `observatory`.


### Environment variables

**Note:** This method isn't supported when using the pre-built docker image.

Place configuration into `.env.local` before building. (See
https://cli.vuejs.org/guide/mode-and-env.html#environment-variables
for general info.)

#### `VUE_APP_OCS_ADDRS`

This variable carries zero or more "OCS configs".  Each "OCS config"
is defined by a name (e.g. "My OCS"; this is only used in this
application), the URL of the WAMP router's websocket server
(e.g. "ws://example.com/crossbar/ws"), the WAMP realm
(e.g. "ocsrealm"), and the OCS "address root" (e.g. "observatory").

Each OCS config is constructed by joining those four things together
with commas; multiple OCS configs are separated by semicolons.  So the
result should look like this:

```
VUE_APP_OCS_ADDRS=My OCS,ws://example.com/crossbar/ws,ocsrealm,observatory
```

(If 3 or fewer tokens are specified, then the address root defaults to
"observatory"; if only 2 tokens are specified then the realm defaults
to "test_realm".)

Here's a multi-config example:
```
VUE_APP_OCS_ADDRS=Lab1,ws://localhost:8001/ws,test_realm;Lab2,ws://localhost:8002/ws,test_realm,platform2
```

(In addition to these "static" OCS configs, the "custom" config is
always available in the interface, and cookies are used to keep a
user's custom URL and realm saved in their browser.)

## Docker

The Dockerfile in this directory will produce an image that serves the built
product from `npm run build` via an nginx server.

To build the image and tag it as "ocs-web":
```
docker build -t ocs-web .
```

To launch the image as a test:
```
docker run -p 8080:80 --rm ocs-web
```

Then browse to http://localhost:8080/

Here is a docker-compose.yaml that declares a service running the
ocs-web image and mounts in a configuration file:
```
version: '2'
services:
  ocs-web-1:
    image: ocs-web
    ports:
      - 8080:80
    volumes:
      - ./config.json:/app/dist/config.json:ro
```

# Development tips

## Mocking Jagent

For development in cases where you can't run the real agent, you can
run a dummy agent with an interface specified in a yaml file.  See the
docstring header in agent/agent.py, and any yaml definition files in
that directory for configuration examples.
