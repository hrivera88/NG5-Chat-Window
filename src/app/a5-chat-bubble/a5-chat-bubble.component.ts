import { Component, OnInit, Input, OnChanges } from "@angular/core";

@Component({
  selector: "a5-chat-bubble",
  templateUrl: "./a5-chat-bubble.component.html",
  styleUrls: ["./a5-chat-bubble.component.css"]
})
export class A5ChatBubbleComponent implements OnInit, OnChanges {
  @Input() userMessage: boolean;
  @Input() messageContent: string;
  @Input() name: string;

  ngOnInit() {}

  ngOnChanges() {}
}
