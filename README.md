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
