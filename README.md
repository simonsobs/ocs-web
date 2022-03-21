# ocs-web

## Background

This is browser-based control panel system for
[OCS](https://github.com/simonsobs/ocs), written in Vue 3.

## Project setup

Run this to fetch all dependencies into the project `node_modules`
directory:

``` npm install ```

## Environment variables

Place configuration into `.env.local` before compiling.  (See
https://cli.vuejs.org/guide/mode-and-env.html#environment-variables
for general info.)

### VUE_APP_OCS_ADDRS

This variable carries zero or more "OCS configs".  Each "OCS config"
is defined by a name (e.g. "My OCS"; this is only used in this
application), the URL of the WAMP router's websocket server
(e.g. "ws://example.com/crossbar"), and the the realm
(e.g. "ocsrealm").

Each OCS config is constructed by joining those three things together
with commas; multiple OCS configs are separated by semicolons.  So the
result should look like this:

```
VUE_APP_OCS_ADDRS=My OCS,ws://example.com/crossbar,ocsrealm
```

Here's a multi-config example:
```
VUE_APP_OCS_ADDRS=Lab1,ws://localhost:8001/ws,test_realm;Lab2,ws://localhost:8002/ws,test_realm
```

(In addtion to these "static" OCS configs, the "custom" config is
always available in the interface, and cookies are used to keep a
user's custom URL and realm saved in their browser.)

## Compiles and hot-reloads for development


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

### Customize configuration
See [Configuration Reference](https://cli.vuejs.org/config/).


## Docker

The Dockerfile in this directory will produce an image that can launch
the Vue development server.  This is a choice made to facilitate
development rather than performance.

To build the image and tag it as "ocs-web":
```
docker build -t ocs-web
```

To launch the image as a test:
```
docker run -p 8080:8080 --rm ocs-web
```

Then browse to http://localhost:8080/

Here is a docker-compose.yaml that declares a service running the
ocs-web image:
```
version: '2'
services:
  ocs-web-1:
    image: ocs-web
    ports:
      - 8080:8080
```

Below, find a few ways to customize the configuration through
docker-compose.

### Environment variables

To set any of the VUE_APP_* environment variables described above, add
them to the docker-compose environment without the VUE_APP_ prefix.
For example:
```
version: '2'
services:
  ocs-web-1:
    image: ocs-web
    ports:
      - 8080:8080
    environment:
      - OCS_ADDRS=My new lab,http://localhost:8080/ws,test_realm
```

(These variables get appended to .env.local inside the container; if
you bind-mount that file make sure it's readonly.)

To set the port on which OCS is served (inside the container), use the
PORT variable;
```
    environment:
      - PORT=8200
```

To set the hostname for which OCS expects to receive connections, use
the HOST variable;
```
    environment:
      - HOST=my-ocs-web-service
```

(If you are proxying OCS and get a "Invalid Host Header" message, try
to fix it with the HOST variable.  This message means that the proxy
is forwarding your requests correctly, but the hostname you're using
in the proxy target does not match the value of HOST (default:
localhost).
