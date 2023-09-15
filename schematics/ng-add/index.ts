import {Rule, SchematicContext, SchematicsException, Tree} from '@angular-devkit/schematics';
import {
  NodePackageInstallTask,
  RunSchematicTask,
} from '@angular-devkit/schematics/tasks';

import {getWorkspace} from '@schematics/angular/utility/workspace';

import {Schema} from './schema';
import * as messages from './messages';
import {addPackageToPackageJson} from '../utils/package-config';

const VERSIONS = {
  // automatically filled from package.json during the build
  'sb-styles': '^0.0.9',
  'client-services': '^4.6.2'
};

/**
 * This is executed when `ng add @project-sunbird/sunbird-pdf-player-v9` is run.
 * It installs all dependencies in the 'package.json' and runs 'ng-add-setup-project' schematic.
 */
export default function ngAdd(options: Schema): Rule {
  return async (tree: Tree, context: SchematicContext) => {

    // Checking that project exists
    const {project} = options;
    if (project) {
      const workspace = await getWorkspace(tree);
      const projectWorkspace = workspace.projects.get(project);

      if (!projectWorkspace) {
        throw new SchematicsException(messages.noProject(project));
      }
    }

    // Installing dependencies
    addPackageToPackageJson(tree, '@project-sunbird/sb-styles', VERSIONS['sb-styles']);
    addPackageToPackageJson(tree, '@project-sunbird/client-services', VERSIONS['client-services']);

    context.addTask(new RunSchematicTask('ng-add-setup-project', options), [
      context.addTask(new NodePackageInstallTask()),
    ]);
  };
}
