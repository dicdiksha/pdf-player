import {Rule, Tree, SchematicsException} from '@angular-devkit/schematics';

import {Schema} from '../schema';
import * as messages from '../messages';
import {getProjectTargetOptions} from '../../utils/project';
import {getWorkspace, updateWorkspace} from '@schematics/angular/utility/workspace';
import {workspaces, JsonArray} from '@angular-devkit/core';
const SB_STYLE_CSS_FILEPATH = 'node_modules/@project-sunbird/sb-styles/assets/_styles.scss';
const SB_STYLE_ASSETS = {
  glob: '**/*.*',
  input: './node_modules/@project-sunbird/sunbird-pdf-player-v9/lib/assets/',
  output: '/assets/'
};
/**
 * we're simply adding '_styles.scss' to the 'angular.json'
 */
export function addSunbirdPdfPlayerStyles(options: Schema): Rule {
  return async (host: Tree) => {
    const workspace: any = await getWorkspace(host);

    const projectName = options.project || (workspace.extensions.defaultProject as string);
    const project = workspace.projects.get(projectName);
    if (!project) {
      throw new SchematicsException(messages.noProject(projectName));
    }
    // just patching 'angular.json'
    return addStyleToAngularJson(workspace, project, host);
  };
}

/**
 * Patches 'angular.json' to add '_styles.scss' styles
 */
function addStyleToAngularJson(
    workspace: any, project: workspaces.ProjectDefinition, host: Tree): Rule {
  const targetOptions = getProjectTargetOptions(project, 'build');
  const styles = (targetOptions.styles as JsonArray | undefined);
  if (!styles) {
    targetOptions.styles = [SB_STYLE_CSS_FILEPATH];
  } else {
    const existingStyles: any = styles.map((s: any) => typeof s === 'string' ? s : s.input);
    for (const[, stylePath] of existingStyles.entries()) {
      // If the given asset is already specified in the styles, we don't need to do anything.
      if (stylePath === SB_STYLE_CSS_FILEPATH) {
        return () => host;
      }
    }
    styles.unshift(SB_STYLE_CSS_FILEPATH);
  }

  const assets = (targetOptions.assets as JsonArray | undefined);
  if (!assets) {
    targetOptions.assets = [SB_STYLE_ASSETS];
  } else {
    const existingAssets: any = assets.map((a: any) => typeof a === 'string' ? a : a.input);
    for (const[, assestPath] of existingAssets.entries()) {
      // If the given asset is already specified in the assets, we don't need to do anything.
      if (assestPath === SB_STYLE_ASSETS.input) {
        return () => host;
      }
    }
    assets.unshift(SB_STYLE_ASSETS);
  }

  return updateWorkspace(workspace);
}
