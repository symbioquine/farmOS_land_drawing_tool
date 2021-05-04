# farmOS_vue_page_demo

A contrib module for [farmOS](https://farmos.org/) demonstrating a packaging strategy for a page built with [Vue.js](https://vuejs.org/)

*Note: Some branches and tags include only the built module. See the [development branch][development branch] for the full source code.*

## Installation

Use Composer and Drush to install farmOS_vue_page_demo in farmOS 2.x;

```sh
composer require symbioquine/farmos_vue_page_demo
drush en farmos_vue_page_demo
```

*Available released versions can be viewed at https://packagist.org/packages/symbioquine/farmos_vue_page_demo*

## FAQs

### How does this work?

The Javascript part of this module gets built by `npm run build` and placed within the Drupal module directory's `js/' folder.

The Drupal part of this module registers a simple controller which renders a page that includes the built javascript and a DOM node for Vue.js to bind to.

### What about installation via Composer?

There are two branches for this repository `development` and `release`. The development workflow for this package involves only pushing changes to the `development` branch and to tags
with a `unbuilt-` prefix.

A Github action is triggered by pushes to the `development` branch and tags with the `unbuilt-` prefix. That action performs the `npm run build` step and pushes the resulting built module
code either to the `release` branch or to regular semantically versioned tags.

The Composer `package.json` file is intentionally not included at the root of the repository for the unbuilt source code.

Due to [how Packagist works](https://packagist.org/about), the main branch for the Git repository must be set to `release` to ensure Packagist can find the Composer `package.json` file.

### Okay, but how about live reload for development?

The `docker/` directory of the [development branch][development branch] of this repository contains a `docker-compose.yml` file which mounts the `farmos_vue_demo_page/` directory of this repository
into the container. That directory is then used as a repository source for Composer to install the Drupal module from. If the Javascript part of this package has already been built, then the module
will function correctly when accessing the farmOS server at http://localhost:80/vue_demo_page, but will not have live-reloading for the Vue.js code.

Next, the Webpack Dev server is used to proxy the farmOS container but replace requests for the assets associated with this module with the development versions - which have special code injected in
them to support live reloading whenever the Vue.js source code changes.

### How do you push new versions?

From the [development branch][development branch] of this repository:

```sh
# Add/commit your changes
git add [...]
# Update NPM package version and commit
npm --no-git-tag-version version --force patch
git commit
# Tag the release with the unbuilt prefix
git tag unbuilt-v9000.0.1
# Push the development branch and new tag
git push --atomic origin HEAD:development unbuilt-v9000.0.1
```

## Development

From the [development branch][development branch] of this repository:

**Start/recreate the farmOS container;**

```sh
cd docker/
./destroy_and_recreate_containers.sh
```

**Run the dev proxy server;**

```sh
npm install
npm run dev
```

Access the demo page at http://localhost:8080/vue_demo_page

[development branch]: https://github.com/symbioquine/farmOS_vue_page_demo/tree/development
