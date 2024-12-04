import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ConfigurationComponent, CanDeactivateConfiguration, CanActivateConfiguration } from './configuration/configuration.component';
import { LabelsComponent } from './labels/labels.component';
import { MainComponent } from './main/main.component';
import { PrintComponent } from './print/print.component';
import { PreviewComponent } from './preview/preview.component';

const routes: Routes = [
  { path: '', component: MainComponent },
  { path: 'configuration', component: ConfigurationComponent, canDeactivate: [CanDeactivateConfiguration], canActivate: [CanActivateConfiguration]},
  { path: 'labels', component: LabelsComponent },
  { path: 'print', component: PrintComponent },
  { path: 'preview', component: PreviewComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { useHash: true })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
