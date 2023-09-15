import {chain, Rule} from '@angular-devkit/schematics';
import {Schema} from './schema';
import {addSppModuleToAppModule} from './steps/add-spp-module'; // spp --> sunbird PDF player
import { addSunbirdPdfPlayerStyles } from './steps/add-spp-style';
/**
 * Sets up a project with all required to run sunbird pdf player.
 * This is run after 'package.json' was patched and all dependencies installed
 */
export default function ngAddSetupProject(options: Schema): Rule {
  return chain([
    addSppModuleToAppModule(options),
    addSunbirdPdfPlayerStyles(options),
  ]);
}
