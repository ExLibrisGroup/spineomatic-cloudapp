import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ConfigurationComponent, ConfigurationGuard } from './configuration/configuration.component';
import { LabelsComponent } from './labels/labels.component';
import { MainComponent } from './main/main.component';
import { PrintComponent } from './print/print.component';

const routes: Routes = [
  { path: '', component: MainComponent },
  { path: 'configuration', component: ConfigurationComponent, canDeactivate: [ConfigurationGuard] },
  { path: 'labels', component: LabelsComponent },
  { path: 'print', component: PrintComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { useHash: true })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
