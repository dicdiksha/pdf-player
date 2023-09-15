import { EventEmitter, Injectable } from '@angular/core';
import { PlayerConfig } from '../playerInterfaces';
import { SunbirdPdfPlayerService } from '../sunbird-pdf-player.service';
import { UtilService } from './util.service';
import * as _ from 'lodash';

@Injectable({
  providedIn: 'root'
})
export class ViewerService {

  public zoom: any = 'auto';
  public rotation = 0;
  public currentPagePointer = 0;
  public totalNumberOfPages = 0;
  public pdfPlayerStartTime: number;
  public pdfLastPageTime: number;
  public endPageSeen = false;
  public timeSpent = '0:0';
  private version = '1.0';
  public playerEvent = new EventEmitter<any>();
  public contentName: string;
  public loadingProgress: number;
  public showDownloadPopup: boolean;
  public src: string;
  public userName: string;
  private metaData: any;
  public isAvailableLocally = false;
  public isEndEventRaised = false;
  public defaultConfig = {};

  constructor(private sunbirdPdfPlayerService: SunbirdPdfPlayerService,
              private utilService: UtilService) { }

  initialize({ context, config, metadata }: PlayerConfig) {
    this.zoom = _.last(config.zoom) || 'auto';
    this.rotation = _.last(config.rotation) || 0;
    this.pdfPlayerStartTime = this.pdfLastPageTime = new Date().getTime();
    this.totalNumberOfPages = 0;
    this.currentPagePointer = _.last(config.pagesVisited) || 1;
    this.contentName = metadata.name;
    this.isAvailableLocally = metadata.isAvailableLocally;
    if (this.isAvailableLocally) {
      const basePath = (metadata.streamingUrl) ? (metadata.streamingUrl) : (metadata.basePath || metadata.baseDir);
      this.src = `${basePath}/${metadata.artifactUrl}`;
    } else {
      this.src =  metadata.streamingUrl || metadata.artifactUrl;
    }
    if (context.userData) {
      const { userData: { firstName, lastName } } = context;
      this.userName = firstName === lastName ? firstName : `${firstName} ${lastName}`;
    }
    this.metaData = {
      pagesVisited: [],
      totalPages: 0,
      duration: [],
      zoom: [],
      rotation: []
    };
    this.loadingProgress = 0;
    this.showDownloadPopup = false;
    this.endPageSeen = false;

    this.defaultConfig = {
      startFromPage: _.last(config.pagesVisited) || 1,
      zoom: this.zoom,
      rotation: this.rotation
    };

  }

  public pageSessionUpdate() {
    this.metaData.pagesVisited.push(this.currentPagePointer);
    this.metaData.duration.push(new Date().getTime() - this.pdfLastPageTime);
    this.metaData.zoom.push(this.zoom);
    this.metaData.rotation.push(this.rotation);
    this.pdfLastPageTime = new Date().getTime();
  }

  raiseStartEvent(event) {
    this.currentPagePointer = this.currentPagePointer > event.pagesCount ? 1 : this.currentPagePointer,
      this.metaData.totalPages = event.pagesCount;
    this.totalNumberOfPages = event.pagesCount;
    const duration = new Date().getTime() - this.pdfPlayerStartTime;
    const startEvent = {
      eid: 'START',
      ver: this.version,
      edata: {
        type: 'START',
        currentPage: this.currentPagePointer,
        duration
      },
      metaData: this.metaData
    };
    this.playerEvent.emit(startEvent);
    this.pdfLastPageTime = this.pdfPlayerStartTime = new Date().getTime();
    this.sunbirdPdfPlayerService.start(duration);
  }

  raiseEndEvent() {
    if  (!this.isEndEventRaised) {
      this.pageSessionUpdate();
      const duration = new Date().getTime() - this.pdfPlayerStartTime;
      const endEvent = {
        eid: 'END',
        ver: this.version,
        edata: {
          type: 'END',
          currentPage: this.currentPagePointer,
          totalPages: this.totalNumberOfPages,
          duration
        },
        metaData: this.getMetadata()
      };
      this.playerEvent.emit(endEvent);
      const visitedlength = (this.metaData.pagesVisited.filter((v, i, a) => a.indexOf(v) === i)).length;
      this.timeSpent = this.utilService.getTimeSpentText(this.pdfPlayerStartTime);
      this.sunbirdPdfPlayerService.end(duration,
        this.currentPagePointer, this.totalNumberOfPages, visitedlength, this.endPageSeen);
      this.isEndEventRaised = true;
    }
  }

  getMetadata() {
    return {
      pagesVisited: this.metaData.pagesVisited.length ? (this.endPageSeen ? [0] : [_.last(this.metaData.pagesVisited)]) : [],
      duration: this.metaData.duration.length ? [_.last(this.metaData.duration)] : [],
      zoom: this.metaData.zoom.length ? [_.last(this.metaData.zoom)] : [],
      rotation: this.metaData.rotation.length ? [_.last(this.metaData.rotation)] : []
    };
  }

  raiseHeartBeatEvent(type: string) {
    const hearBeatEvent = {
      eid: 'HEARTBEAT',
      ver: this.version,
      edata: {
        type,
        currentPage: this.currentPagePointer
      },
      metaData: this.metaData
    };
    this.playerEvent.emit(hearBeatEvent);
    this.sunbirdPdfPlayerService.heartBeat(hearBeatEvent);
    if (type === 'PAGE_CHANGE') {
      this.sunbirdPdfPlayerService.impression(this.currentPagePointer);
    }
    const interactItems = ['CLOSE_DOWNLOAD', 'DOWNLOAD', 'ZOOM_IN',
      'ZOOM_OUT', 'NAVIGATE_TO_PAGE',
      'NEXT', 'OPEN_MENU', 'PREVIOUS', 'CLOSE_MENU', 'DOWNLOAD_MENU',
      'SHARE', 'ROTATION_CHANGE', 'REPLAY' , 'PRINT', 'NEXT_CONTENT_PLAY'
    ];
    if (interactItems.includes(type)) {
      this.sunbirdPdfPlayerService.interact(type.toLowerCase(), this.currentPagePointer);
    }

  }

  raiseExceptionLog(errorCode: string , errorType: string , stacktrace , traceId ) {
    const exceptionLogEvent = {
      eid: 'ERROR',
      edata: {
          err: errorCode,
          errtype: errorType,
          requestid: traceId || '',
          stacktrace: (stacktrace && stacktrace.toString()) || '',
      }
    };
    this.playerEvent.emit(exceptionLogEvent);
    this.sunbirdPdfPlayerService.error(stacktrace, { err: errorCode, errtype: errorType });
  }
}
