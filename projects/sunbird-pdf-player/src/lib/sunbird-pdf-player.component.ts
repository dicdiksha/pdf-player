import {
  AfterViewInit, ChangeDetectorRef, Component,

  ElementRef, EventEmitter,
  HostListener, Input,
  OnChanges, OnDestroy, OnInit, Output,

  Renderer2, SimpleChanges,
  ViewChild
} from '@angular/core';
import { Config, PlayerConfig } from './playerInterfaces';
import { ViewerService } from './services/viewer.service';
import { SunbirdPdfPlayerService } from './sunbird-pdf-player.service';
import * as _ from 'lodash';
import { ErrorService, errorCode, errorMessage } from '@project-sunbird/sunbird-player-sdk-v9';
import { HttpClient} from "@angular/common/http";

@Component({
  selector: 'sunbird-pdf-player',
  templateUrl: './sunbird-pdf-player.component.html',
  styleUrls: ['./sunbird-pdf-player.component.scss']
})
export class SunbirdPdfPlayerComponent implements OnInit, OnDestroy, OnChanges, AfterViewInit {
  public pdfConfig: Config;
  private subscription;
  public viewState = 'start';
  public showControls = true;
  public traceId: string;
  public nextContent: any;
  public validPage = true;

  @ViewChild('pdfPlayer', { static: true }) pdfPlayerRef: ElementRef;
  sideMenuConfig = {
    showShare: true,
    showDownload: true,
    showReplay: true,
    showExit: false,
    showPrint: true
  };
  @Input() playerConfig: PlayerConfig;
  @Input() action: string;
  @Output() playerEvent: EventEmitter<object>;
  @Output() telemetryEvent: EventEmitter<any> = new EventEmitter<any>();

  headerConfig = {
    rotation: true,
    goto: true,
    navigation: true,
    zoom: true
  };

  viewerActions: EventEmitter<any> = new EventEmitter<any>();
  private unlistenMouseEnter: () => void;
  private unlistenMouseLeave: () => void;
  showContentError: boolean;
  defaultCompatibilityLevel = 4;
  url: string = 'https://meity-auth.ulcacontrib.org/ulca/apis/v0/model/compute';
  audio: any = '';
  audioQueue: any[] = [];
  isPlaying: boolean = false;
  counter: number = 0;
  loading: boolean = false;
  chunks=[]
  isStreamIntrupted: boolean =false;
  languageList =[
    {languageCode:'en',modelId:'6576a17e00d64169e2f8f43d'},
    {languageCode:'hi',modelId:'6576a1e500d64169e2f8f43e'},
    {languageCode:'as',modelId:'6576a15e00d64169e2f8f43c'},
    {languageCode:'bn',modelId:'6348db11fb796d5e100d4ffb'},
    {languageCode:'gu',modelId:'6348db16fd966563f61bc2c1'},
    {languageCode:'kn',modelId:'6576a2344e7d42484da63534'},
    {languageCode:'mr',modelId:'633c02befd966563f61bc2be'},
    {languageCode:'or',modelId:'6348db26fd966563f61bc2c2'},
    {languageCode:'pa',modelId:'6576a27800d64169e2f8f440'},
    {languageCode:'ta',modelId:'6348db32fd966563f61bc2c3'},
    {languageCode:'te',modelId:'6348db37fb796d5e100d4ffe'},
    {languageCode:'ur',modelId:'6576a2b000d64169e2f8f442'}
  ]

  constructor(
    public pdfPlayerService: SunbirdPdfPlayerService,
    public viewerService: ViewerService,
    private cdRef: ChangeDetectorRef,
    private renderer2: Renderer2,
    public errorService: ErrorService,
    public http: HttpClient
  ) {

    this.playerEvent = this.viewerService.playerEvent;
  }

  @HostListener('document:TelemetryEvent', ['$event'])
  onTelemetryEvent(event) {
    this.telemetryEvent.emit(event.detail);
  }

  ngOnInit() {
    if (typeof this.playerConfig === 'string') {
      try {
        this.playerConfig = JSON.parse(this.playerConfig);
      } catch (error) {
        console.error('Invalid playerConfig: ', error);
      }
    }

    this.nextContent = this.playerConfig.config.nextContent;
    this.viewState = 'start';
    this.pdfConfig = { ...this.viewerService.defaultConfig, ...this.playerConfig.config };
    this.sideMenuConfig = { ...this.sideMenuConfig, ...this.playerConfig.config.sideMenu };
    this.pdfPlayerService.initialize(this.playerConfig);
    this.viewerService.initialize(this.playerConfig);
  }

  ngAfterViewInit() {
    const pdfPlayerElement = this.pdfPlayerRef.nativeElement;
    this.unlistenMouseEnter = this.renderer2.listen(pdfPlayerElement, 'mouseenter', () => {
      this.showControls = true;
    });

    this.unlistenMouseLeave = this.renderer2.listen(pdfPlayerElement, 'mouseleave', () => {
      this.showControls = false;
    });

    this.traceId = this.playerConfig.config?.traceId;

    const contentCompabilityLevel = this.playerConfig.metadata.compatibilityLevel;
    if (contentCompabilityLevel) {
      const checkContentCompatible = this.errorService.checkContentCompatibility(contentCompabilityLevel);
      if (!checkContentCompatible.isCompitable) {
        // tslint:disable-next-line:max-line-length
        this.viewerService.raiseExceptionLog(errorCode.contentCompatibility, errorMessage.contentCompatibility, checkContentCompatible.error, this.traceId);
      }
    }
  }

  headerActions({ type, data }) {
    if (type === 'NEXT' && this.viewerService.currentPagePointer === this.viewerService.totalNumberOfPages) {
      this.viewerService.raiseEndEvent();
      this.viewState = 'end';
      this.viewerService.endPageSeen = true;
      this.cdRef.detectChanges();
      return;
    }
    this.viewerActions.emit({ type, data });
    this.viewerService.raiseHeartBeatEvent(type);

  }

  handleNotification() {
    this.handleButtonstop();
  }
  
  handleButtonplay(){
    this.audio.play();
  }

  handleButtonpause(){
    this.audio.pause();
  }
  handleButtonstop() {
    this.audio.pause();
    this.audio.src ='';
    this.isStreamIntrupted = true;
    console.log(this.audio,"emptied audio");
    this.counter =0;
    this.isPlaying =false;
   
  }
  getModelId(languageCode:string) {
    const language = this.languageList.find(lang => lang.languageCode === languageCode);
    console.log(language.modelId)
    return language ? language.modelId : null;
  }

  async detectLanguage(chunk: string): Promise<string | null> {
    return new Promise((resolve, reject) => {
      const payload ={
        input: [
          { source: chunk }
        ],
        modelId: "631736990154d6459973318e",
        task: "txt-lang-detection",
        userId: "49eb8255277b40ddb7d706a100b36268"
      };
  
      this.http.post(this.url, payload).subscribe(
        (res: any) => {
          const langCode = res.output[0].langPrediction[0].langCode;
          const modelId = this.getModelId(langCode);
          resolve(modelId);
        },
        error => {
          console.error('Error detecting language:', error);
          resolve(null); // Resolve with null if there's an error
        }
      );
    });
  }
  
   async handleButtonClick(gender: any) {
        this.isStreamIntrupted =false;
        this.audioQueue =[]
        let container = document.querySelector('pdf-viewer');
        if (container) {
        let iframe = container.querySelector('iframe');
        if (iframe) {
            const pageNumber = document.querySelector(".page-count").getAttribute('current-page-number');
            var iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
            var elementInsideIframe = iframeDoc.querySelector('#viewer');
            console.log(elementInsideIframe,'this is irame')
            const textLayer = elementInsideIframe.getElementsByClassName('textLayer')[pageNumber];
            const spans = textLayer.querySelectorAll('span');
            let extractedText = '';
            spans.forEach(span => {
                  extractedText += span.textContent + '\n';
            });
              console.log(extractedText,'this is extracted text');
              this.chunks = this.chunkText(extractedText, 500);
              for (let i = 0; i < this.chunks.length; i++) {
                if(!this.isStreamIntrupted){
                  console.log(this.chunks[i], 'this is chunks');
                  const modelId = await this.detectLanguage(this.chunks[i]);
                  await this.processChunk(this.chunks[i], gender,modelId);
                }
                else{
                  this.chunks =[];
                  break;
                }
                }
        } 
       
      }
    }
  
  async processChunk(chunk: string, gender: any,modelId: string | null) {
    if (!modelId) {
      console.error('Model ID not found.');
      return;
    }
  
    const payload = {
      modelId:modelId,
      task: 'tts',
      input: [{ source: chunk }],
      gender: gender,
      userId: '49eb8255277b40ddb7d706a100b36268',
    };
  
    try {
      const response: any = await this.http.post(this.url, payload).toPromise();
      console.log(response);
  
      const audioContent = response.audio[0].audioContent;
      const base64Audio = audioContent;
      const audioUrl = 'data:audio/mp3;base64,' + base64Audio;
      console.log(audioUrl,'this is audio Url')
      this.audioQueue.push(audioUrl);
  
      if (!this.isPlaying) {
        this.playNextAudio();
      }
    } catch (error) {
      this.loading = false;
      console.error('Error processing audio:', error);
    }
  }
  playNextAudio() {
    console.log('play next audio',this.audioQueue.length)
    if (this.audioQueue.length > 0 && !this.isStreamIntrupted) {
      console.log('counter ' ,this.counter)
      this.loading = false;
      const audioUrl = this.audioQueue[this.counter++]; //this.audioQueue.shift();
      
      this.audio = new Audio(audioUrl);
      this.audio.controls = true;
      
      this.isPlaying = true;

      // Play the audio
      this.audio.play();
  
  
      // Listen for audio end event to play the next audio
      this.audio.addEventListener('ended', () => {
        // Reset flag when audio ends
        this.isPlaying = false;
  
        // Play the next audio in the queue
        this.playNextAudio();
      });
    }
     else {
      // No more audio in the queue, reset flag
      this.isPlaying = false;
    }
  }

   // Function to split text into chunks
   chunkText(text: string, chunkSize: number): string[] {
    const chunks: string[] = [];
    if (!text) return chunks; // Return empty array if text is falsy
  
    for (let i = 0; i < text.length; i += chunkSize) {
      chunks.push(text.substring(i, i + chunkSize));
    }
    return chunks;
  }

  playContent(event) {
    this.viewerService.raiseHeartBeatEvent(event.type);
  }

  sideBarEvents(event) {
    this.viewerService.raiseHeartBeatEvent(event.type);
    this.viewerActions.emit({ type: event.type });
  }

  replayContent(event) {
    this.viewerService.raiseHeartBeatEvent(event.type);
    this.ngOnInit();
    this.viewerActions.emit({ type: 'REPLAY' });
    this.viewerService.isEndEventRaised = false;
    this.cdRef.detectChanges();
  }

  exitContent(event) {
    this.viewerService.raiseHeartBeatEvent(event.type);
  }

  public onPdfLoaded(event): void {
    const startEvent = this.viewerService.raiseStartEvent(event);
    this.telemetryEvent.emit(startEvent);
    this.viewState = 'player';
    this.cdRef.detectChanges();
  }

  public onPdfLoadFailed(error: Error): void {
    let code = errorCode.contentLoadFails;
    let message = errorMessage.contentLoadFails;
    if (!navigator.onLine) {
      code = errorCode.internetConnectivity;
      message = errorMessage.internetConnectivity;
    }
    if (this.viewerService.isAvailableLocally) {
      code = errorCode.contentLoadFails;
      message = errorMessage.contentLoadFails;
    }

    if (code === errorCode.contentLoadFails) {
      this.showContentError = true;
    }
    this.viewerService.raiseExceptionLog(code, message, error, this.traceId);
  }

  public onZoomChange(event: any): void {
    this.viewerService.pageSessionUpdate();
    this.viewerService.raiseHeartBeatEvent('ZOOM_CHANGE');
    this.viewerService.zoom = event;
  }

  public onPdfDownloaded(): void {
    this.viewerService.raiseHeartBeatEvent('PDF_DOWNLOAD');
  }

  public onAfterPrint() {
    this.viewerService.raiseHeartBeatEvent('PDF_PRINT');
  }

  public onRotationChange(event: any): void {
    this.viewerService.pageSessionUpdate();
    this.viewerService.raiseHeartBeatEvent('ROTATION_CHANGE');
    this.viewerService.rotation = event;
  }

  // On Page next and previous or scroll
  public onPageChange(event: any): void {
    this.viewerService.pageSessionUpdate();
    this.viewerService.currentPagePointer = event.pageNumber;
    this.viewerService.raiseHeartBeatEvent('PAGE_CHANGE');
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.action) {
      this.viewerActions.emit({ type: changes.action });
    }
  }

  public viewerEvent({ type, data }) {
    if (type === 'progress') {
      this.viewerService.loadingProgress = data;
    } else if (type === 'pagesloaded') {
      this.onPdfLoaded(data);
    } else if (type === 'pagechanging') {
      this.onPageChange(data);
    } else if (type === 'rotatecw') {
      this.onRotationChange(data);
    } else if (type === 'pageend') {
      this.viewerService.raiseEndEvent();
      this.viewerService.endPageSeen = true;
      this.viewState = 'end';
    } else if (type === 'error') {
      this.onPdfLoadFailed(data);
    } else if (type === 'INVALID_PAGE_ERROR') {
      this.validPage = data;
      this.resetValidPage();
    }
    this.cdRef.detectChanges();
  }

  resetValidPage() {
    setTimeout(() => {
      this.validPage = true;
      this.cdRef.detectChanges();
    }, 5000);
  }

  @HostListener('window:beforeunload')
  ngOnDestroy() {
    this.viewerService.raiseEndEvent();
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
    this.viewerService.isEndEventRaised = false;
    this.unlistenMouseEnter();
    this.unlistenMouseLeave();
    // this.unlistenTouch();
  }
}
