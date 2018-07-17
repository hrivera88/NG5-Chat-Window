import { Component, OnInit, ViewChild, AfterViewInit } from "@angular/core";
import { faComment, faMicrophone } from "@fortawesome/free-solid-svg-icons";
import { Message } from "./message";
import { Option } from "./option";
import * as AWS from "aws-sdk";
import * as _ from "lodash";
import * as RecordRTC from "recordrtc";
import * as LexAudio from "../../assets/js/aws-lex-audio.min.js";

@Component({
  selector: "a5-chat-window",
  templateUrl: "./a5-chat-window.component.html",
  styleUrls: ["./a5-chat-window.component.css"]
})
export class A5ChatWindowComponent implements OnInit, AfterViewInit {
  @ViewChild("testAudio") audio;
  lexRuntime: any;
  lexUserID = "Halbot" + Date.now();
  botOptionsTitle: string;
  botMenuOptions: Option[] = [];
  faComment = faComment;
  faMicrophone = faMicrophone;
  userMessageInput: string;
  showMainMenuOptions = true;
  showMainMenuButton = false;
  showBotOptions = false;
  messages: Message[] = [];
  isRecording = false;
  private stream: MediaStream;
  private recordRTC: any;
  audioControl: any;

  constructor() {
    AWS.config.region = "us-east-1";
    AWS.config.credentials = new AWS.CognitoIdentityCredentials({
      IdentityPoolId: "us-east-1:21ece9e8-d2f1-4d74-9e3b-dbf9acd25e06"
    });
    this.lexRuntime = new AWS.LexRuntime();
  }

  ngOnInit() {
    this.sendTextMessageToBot("menu");
  }

  toggleControls() {
    let audio: HTMLAudioElement = this.audio.nativeElement;
    audio.muted = !audio.muted;
    audio.controls = !audio.controls;
    audio.autoplay = !audio.autoplay;
  }

  successCallback(stream: MediaStream) {
    let options = {
      mimeType: "audio/wav",
      type: "audio",
      desiredSampRate: 16000
    };
    this.stream = stream;
    this.recordRTC = RecordRTC(stream, options);
    this.recordRTC.startRecording();
    let audio: HTMLAudioElement = this.audio.nativeElement;
    audio.src = window.URL.createObjectURL(stream);
    this.toggleControls();
  }

  errorCallback() {}

  processAudio(audioWebURL) {
    let recordRTC = this.recordRTC;
    console.log("wahats up", recordRTC);
    let audio: HTMLAudioElement = this.audio.nativeElement;
    audio.src = audioWebURL;
    this.toggleControls();
    let recordedBlob = recordRTC.getBlob();
    this.sendSpeechMessageToBot(recordedBlob);
  }

  sendSpeechMessageToBot(stream: any) {
    console.log("Sending speech audio");
    let params = {
      botAlias: "$LATEST",
      botName: "CubsBot",
      contentType: "audio/x-l16; sample-rate=16000; channel-count=1",
      userId: this.lexUserID,
      accept: "audio/pcm",
      inputStream: stream
    };
    this.lexRuntime.postContent(params, function(err, data) {
      if (err) {
        console.log("yoo goof, ", err);
      } else {
        console.log("RESPONSE BOT :", data);
      }
    });
  }

  startRecording() {
    console.log;
    let mediaConstraints = {
      audio: true
    };
    navigator.mediaDevices
      .getUserMedia(mediaConstraints)
      .then(this.successCallback.bind(this), this.errorCallback.bind(this));
  }

  stopRecording() {
    console.log("stopped");
    let recordRTC = this.recordRTC;
    recordRTC.stopRecording(this.processAudio.bind(this));
    let stream = this.stream;
    stream.getAudioTracks().forEach(track => track.stop());
  }

  speakToBot() {
    if (this.isRecording) {
      console.log("Im stopping");
      this.isRecording = false;
      this.stopRecording();
    } else {
      console.log("Im starting");
      this.isRecording = true;
      this.startRecording();
    }
  }

  ngAfterViewInit() {
    let audio: HTMLAudioElement = this.audio.nativeElement;
    audio.muted = false;
    audio.controls = true;
    audio.autoplay = false;
  }

  showResponse(isUserMessage: boolean, message: string) {
    // Check whether the User to show a response from the User or Bot
    if (isUserMessage) {
      let response: Message = {
        userMessage: true,
        name: "",
        message: message
      };
      //Add User's response to Messages UI
      this.messages.unshift(response);
    } else {
      let response: Message = {
        userMessage: false,
        name: "",
        message: message
      };
      //Add Bot's response to Messages UI
      this.messages.unshift(response);
    }
  }

  loopThroughBotResponseCardButtons(responseCardButtons) {
    _.map(responseCardButtons, opt => {
      this.botMenuOptions.push(opt);
    });
  }

  showBotResponseToUser(botResponse) {
    //Display Bot's response to Chat UI
    this.showResponse(false, botResponse.message);
    //Check whether the Dialog is at the ending state or not.
    if (botResponse.dialogState !== "Fulfilled" && !botResponse.responseCard) {
      this.showMainMenuButton = false;
      this.showBotOptions = false;
      this.showMainMenuOptions = false;
    } else if (
      botResponse.responseCard &&
      botResponse.dialogState !== "Fulfilled"
    ) {
      this.botMenuOptions = [];
      //If the Bot response has a Response Card with Options show them in the UI
      this.botOptionsTitle =
        botResponse.responseCard.genericAttachments[0].title;
      this.showMainMenuOptions = false;
      this.loopThroughBotResponseCardButtons(
        botResponse.responseCard.genericAttachments[0].buttons
      );
      this.showBotOptions = true;
    } else {
      if (botResponse.responseCard) {
        //If the Bot response has a Response Card with Options show them in the UI
        this.botMenuOptions = [];
        this.botOptionsTitle =
          botResponse.responseCard.genericAttachments[0].title;
        this.loopThroughBotResponseCardButtons(
          botResponse.responseCard.genericAttachments[0].buttons
        );
        this.showMainMenuOptions = false;
        this.showBotOptions = true;
      } else {
        this.showBotOptions = false;
        this.showMainMenuOptions = false;
        this.showMainMenuButton = true;
      }
    }
  }

  submitMessageToBot(message: any) {
    let usersMessage = message;
    this.showResponse(true, usersMessage);
    this.sendTextMessageToBot(usersMessage);
  }

  sendTextMessageToBot(textMessage) {
    this.userMessageInput = "";
    // Gather needed parameters for Amazon Lex
    let params = {
      botAlias: "$LATEST",
      botName: "CubsBot",
      inputText: textMessage,
      userId: this.lexUserID
    };
    // Send Main Menu Button text value to Amazon Lex Bot
    this.lexRuntime.postText(params, (err, data) => {
      if (err) {
        console.log(err, err.stack);
      }
      if (data) {
        console.log("boooottttttttt: ", data);
        this.showBotResponseToUser(data);
      }
    });
  }

  chooseBotOption(evt: any) {
    let optionText = evt.target.value;
    this.showResponse(true, optionText);
    this.sendTextMessageToBot(optionText);
  }

  chooseMainOption(evt: any) {
    //Get text value from Main Menu Button
    let optionText = evt.target.value;
    // Show Main Menu Button text value in Messages UI
    this.showResponse(true, optionText);
    this.sendTextMessageToBot(optionText);
  }
}
