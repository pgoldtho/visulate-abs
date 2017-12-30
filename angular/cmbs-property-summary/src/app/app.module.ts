import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatExpansionModule } from '@angular/material/expansion';

import { AppComponent } from './app.component';
import { UsIndexComponent } from './us-index/us-index.component';
import { UsIndexService } from './us-index.service';


@NgModule({
  declarations: [
    AppComponent,
    UsIndexComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    NoopAnimationsModule,
    MatExpansionModule
  ],
  providers: [UsIndexService],
  bootstrap: [AppComponent]
})
export class AppModule { }
