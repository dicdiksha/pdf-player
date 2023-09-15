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

  constructor(
    public pdfPlayerService: SunbirdPdfPlayerService,
    public viewerService: ViewerService,
    private cdRef: ChangeDetectorRef,
    private renderer2: Renderer2,
    public errorService: ErrorService
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
