import { BrowserModule } from "@angular/platform-browser";
import { NgModule } from "@angular/core";
import { FormsModule } from "@angular/forms";

import { AppComponent } from "./app.component";
import { A5ChatWindowComponent } from "./a5-chat-window/a5-chat-window.component";

import { FontAwesomeModule } from "@fortawesome/angular-fontawesome";
import { A5ChatBubbleComponent } from "./a5-chat-bubble/a5-chat-bubble.component";
import { HtmlSanitizerPipe } from "./html-sanitizer.pipe";

@NgModule({
  declarations: [
    AppComponent,
    A5ChatWindowComponent,
    A5ChatBubbleComponent,
    HtmlSanitizerPipe
  ],
  imports: [BrowserModule, FontAwesomeModule, FormsModule],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {}
