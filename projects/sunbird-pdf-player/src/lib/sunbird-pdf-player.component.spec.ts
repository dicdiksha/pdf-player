import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { SunbirdPdfPlayerComponent } from './sunbird-pdf-player.component';
import { NO_ERRORS_SCHEMA, Renderer2 } from '@angular/core';
import { ViewerService } from './services/viewer.service';
import { SunbirdPdfPlayerService } from './sunbird-pdf-player.service';
import { mockData } from '../lib/services/viewer.service.spec.data';

describe('SunbirdPdfPlayerComponent', () => {
  let component: SunbirdPdfPlayerComponent;
  let fixture: ComponentFixture<SunbirdPdfPlayerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SunbirdPdfPlayerComponent ],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [ViewerService, SunbirdPdfPlayerService]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SunbirdPdfPlayerComponent);
    component = fixture.componentInstance;
    component.playerConfig = mockData.playerConfig;
    fixture.detectChanges();
  });

  it('should initialize player config', () => {
    const sunbirdPdfPlayerService = TestBed.get(SunbirdPdfPlayerService);
    const viewerService = TestBed.get(ViewerService);
    spyOn(sunbirdPdfPlayerService, 'initialize');
    spyOn(viewerService, 'initialize');
    component.ngOnInit();
    expect(component.viewState).toEqual('start');
    expect(sunbirdPdfPlayerService.initialize).toHaveBeenCalled();
    expect(viewerService.initialize).toHaveBeenCalled();
  });

  it('should show controls on mouse enter', () => {
    const renderer2Stub: Renderer2 = fixture.debugElement.injector.get(Renderer2);
    spyOn(renderer2Stub, 'listen');
    component.ngAfterViewInit();
    const event = new MouseEvent('mouseenter', {});
    component.pdfPlayerRef.nativeElement.dispatchEvent(event);
    fixture.detectChanges();
    expect(renderer2Stub.listen).toHaveBeenCalled();
    expect(component.showControls).toBeTruthy();
  });

  it('should hide controls on mouse leave', () => {
    const renderer2Stub: Renderer2 = fixture.debugElement.injector.get(Renderer2);
    spyOn(renderer2Stub, 'listen');
    component.ngAfterViewInit();
    const event = new MouseEvent('mouseleave', {});
    component.pdfPlayerRef.nativeElement.dispatchEvent(event);
    fixture.detectChanges();
    expect(renderer2Stub.listen).toHaveBeenCalled();
    expect(component.showControls).toBeFalsy();
  });

  it('should call header action for zoom', () => {
    spyOn(component.viewerActions, 'emit');
    const viewerService = TestBed.get(ViewerService);
    spyOn(viewerService, 'raiseHeartBeatEvent');
    component.headerActions({type: 'ZOOM_IN', data: ''});
    expect(component.viewerActions.emit).toHaveBeenCalled();
    expect(viewerService.raiseHeartBeatEvent).toHaveBeenCalled();
  });

  it('should call header action for NEXT event', () => {
    spyOn(component.viewerActions, 'emit');
    const viewerService = TestBed.get(ViewerService);
    spyOn(viewerService, 'raiseHeartBeatEvent');
    component.headerActions({type: 'NEXT', data: ''});
    expect(component.viewerActions.emit).toHaveBeenCalled();
    expect(viewerService.raiseHeartBeatEvent).toHaveBeenCalled();
  });

  xit('should call header action for NEXT event and end page', () => {
    spyOn(component.viewerActions, 'emit');
    const viewerService = TestBed.get(ViewerService);
    spyOn(viewerService, 'raiseHeartBeatEvent');
    spyOn(viewerService, 'raiseEndEvent');
    viewerService.totalNumberOfPages = 1;
    component.headerActions({type: 'NEXT', data: ''});
    expect(component.viewerActions.emit).toHaveBeenCalled();
    expect(viewerService.raiseHeartBeatEvent).toHaveBeenCalled();
    expect(viewerService.raiseEndEvent).toHaveBeenCalled();
    expect(viewerService.endPageSeen).toBeTruthy();
  });

  it('should call sideBarEvents', () => {
    spyOn(component.viewerActions, 'emit');
    const viewerService = TestBed.get(ViewerService);
    spyOn(viewerService, 'raiseHeartBeatEvent');
    component.sideBarEvents({});
    expect(component.viewerActions.emit).toHaveBeenCalled();
    expect(viewerService.raiseHeartBeatEvent).toHaveBeenCalled();
  });

  it('should replay content', () => {
    spyOn(component.viewerActions, 'emit');
    const viewerService = TestBed.get(ViewerService);
    spyOn(viewerService, 'raiseHeartBeatEvent');
    spyOn(component, 'ngOnInit');
    component.replayContent({type: 'REPLAY'});
    expect(component.viewerActions.emit).toHaveBeenCalled();
    expect(viewerService.raiseHeartBeatEvent).toHaveBeenCalled();
    expect(component.ngOnInit).toHaveBeenCalled();
  });

  it('should call on pdf load and raise start event', () => {
    const viewerService = TestBed.get(ViewerService);
    spyOn(viewerService, 'raiseStartEvent');
    component.onPdfLoaded({type: 'LOAD'});
    expect(component.viewState).toEqual('player');
    expect(viewerService.raiseStartEvent).toHaveBeenCalled();
  });

  xit('should call on pdf load fail and raise error event', () => {
    const viewerService = TestBed.get(ViewerService);
    spyOn(viewerService, 'raiseErrorEvent');
    component.onPdfLoadFailed(new Error());
    expect(component.viewState).toEqual('player');
    expect(viewerService.raiseExceptionLog).toHaveBeenCalled();
  });

  it('should call onZoomChange', () => {
    const viewerService = TestBed.get(ViewerService);
    spyOn(viewerService, 'pageSessionUpdate');
    spyOn(viewerService, 'raiseHeartBeatEvent');
    component.onZoomChange(1);
    expect(viewerService.pageSessionUpdate).toHaveBeenCalled();
    expect(viewerService.raiseHeartBeatEvent).toHaveBeenCalled();
  });

  it('should raise raiseHeartBeatEvent onPdfDownloaded', () => {
    const viewerService = TestBed.get(ViewerService);
    spyOn(viewerService, 'raiseHeartBeatEvent');
    component.onPdfDownloaded();
    expect(viewerService.raiseHeartBeatEvent).toHaveBeenCalled();
  });

  it('should raise raiseHeartBeatEvent onAfterPrint', () => {
    const viewerService = TestBed.get(ViewerService);
    spyOn(viewerService, 'raiseHeartBeatEvent');
    component.onAfterPrint();
    expect(viewerService.raiseHeartBeatEvent).toHaveBeenCalled();
  });

  it('should raise raiseHeartBeatEvent onRotationChange', () => {
    const viewerService = TestBed.get(ViewerService);
    spyOn(viewerService, 'raiseHeartBeatEvent');
    spyOn(viewerService, 'pageSessionUpdate');
    component.onRotationChange({type: 'rotatecw'});
    expect(viewerService.raiseHeartBeatEvent).toHaveBeenCalled();
    expect(viewerService.pageSessionUpdate).toHaveBeenCalled();
  });

  it('should raise raiseHeartBeatEvent onPageChange', () => {
    const viewerService = TestBed.get(ViewerService);
    spyOn(viewerService, 'raiseHeartBeatEvent');
    spyOn(viewerService, 'pageSessionUpdate');
    component.onPageChange({pageNumber: 2});
    expect(viewerService.raiseHeartBeatEvent).toHaveBeenCalled();
    expect(viewerService.pageSessionUpdate).toHaveBeenCalled();
  });

  it('should call viewer events', () => {
    const viewerService = TestBed.get(ViewerService);
    component.viewerEvent({type: 'progress', data: ''});
    expect(viewerService.loadingProgress).toEqual('');
  });

  it('should call viewer events for pagesloaded', () => {
    spyOn(component, 'onPdfLoaded');
    component.viewerEvent({type: 'pagesloaded', data: ''});
    expect(component.onPdfLoaded).toHaveBeenCalled();
  });

  it('should call viewer events for pagechanging', () => {
    spyOn(component, 'onPageChange');
    component.viewerEvent({type: 'pagechanging', data: ''});
    expect(component.onPageChange).toHaveBeenCalled();
  });

  it('should call viewer events for rotatecw', () => {
    spyOn(component, 'onRotationChange');
    component.viewerEvent({type: 'rotatecw', data: ''});
    expect(component.onRotationChange).toHaveBeenCalled();
  });

  it('should call viewer events for pageend', () => {
    const viewerService = TestBed.get(ViewerService);
    spyOn(viewerService, 'raiseEndEvent');
    component.viewerEvent({type: 'pageend', data: ''});
    expect(viewerService.endPageSeen).toBeTruthy();
  });

  it('should call viewer events for error', () => {
    spyOn(component, 'onPdfLoadFailed');
    component.viewerEvent({type: 'error', data: ''});
    expect(component.onPdfLoadFailed).toHaveBeenCalled();
  });
});
