# farmOS_land_drawing_tool

A land drawing tool contrib module for [farmOS](https://farmos.org/) 3.x.

![image](https://user-images.githubusercontent.com/30754460/124950481-4c81e800-dfc7-11eb-8c35-4545883d72ff.png)

*Note: Some branches and tags include only the built module. See the [development branch][development branch] for the full source code.*

## Installation

Use Composer and Drush to install farmOS_land_drawing_tool in farmOS 3.x;

```sh
composer require drupal/farmos_land_drawing_tool
drush en farmos_land_drawing_tool
```

*Available released versions can be viewed at https://www.drupal.org/project/farmos_land_drawing_tool*

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

Access the demo page at http://localhost:8080/asset/draw/land

### Procedure for pushing new versions

From the [development branch][development branch] of this repository:

```sh
# Add/commit your changes
git add [...]
# Update NPM package version and commit
npm --no-git-tag-version version --force patch
git add -u
git commit
# Tag the release with the unbuilt prefix
git tag unbuilt-v9000.0.1
# Push the development branch and new tag
git push --atomic origin HEAD:development unbuilt-v9000.0.1
```

[development branch]: https://github.com/symbioquine/farmOS_land_drawing_tool/tree/development
