var chai = require('chai');
var sinon = require('sinon');
var sinonChai = require("sinon-chai");
var requireUncached = require('require-uncached');
var Promise = require('promise');

chai.use(sinonChai);
var should = chai.should();
var expect = chai.expect;


describe('Recorder unsupported', function(){

  var Recorder = require('../dist/recorder.min');

  it('should not support Recording', function () {
    expect(Recorder.isRecordingSupported()).to.not.be.ok;
  });

  it('should throw an error', function () {
    expect(Recorder).to.throw("Recording is not supported in this browser");
  });

});

describe('Recorder', function(){

  var sandbox = sinon.sandbox.create();
  var Recorder;

  var requireRecorder = function(){
    Recorder = requireUncached('../dist/recorder.min');
    sinon.spy(Recorder.prototype, 'ondataavailable');
    sinon.spy(Recorder.prototype, 'onstart');
    sinon.spy(Recorder.prototype, 'onstop');
    sinon.spy(Recorder.prototype, 'onpause');
    sinon.spy(Recorder.prototype, 'onresume');
  };

  beforeEach(function(){
    global.AudioContext = sandbox.stub();
    global.AudioContext.prototype.createGain = sandbox.stub().returns({ 
      connect: sandbox.stub(),
      disconnect: sandbox.stub(),
      gain: {
        setTargetAtTime: sandbox.stub()
      }
    });
    global.AudioContext.prototype.createScriptProcessor = sandbox.stub().returns({
      connect: sandbox.stub(),
      disconnect: sandbox.stub()
    });
    global.AudioContext.prototype.createMediaStreamSource = sandbox.stub().returns({ 
      connect: sandbox.stub(),
      disconnect: sandbox.stub()
    });
    global.AudioContext.prototype.sampleRate = 44100;

    global.Event = sandbox.stub();
    global.CustomEvent = sandbox.stub();
    global.ErrorEvent = sandbox.stub();

    global.navigator = {};
    global.navigator.mediaDevices = {};
    global.navigator.mediaDevices.getUserMedia = sandbox.stub().resolves({
      stop: sandbox.stub()
    });

    global.document = {};
    global.document.createDocumentFragment = sandbox.stub().returns({
      addEventListener: sandbox.stub(),
      removeEventListener: sandbox.stub(),
      dispatchEvent: sandbox.stub()
    });

    global.Worker = sandbox.stub();
    global.Worker.prototype.addEventListener = sandbox.stub();
    global.Worker.prototype.postMessage =  sandbox.stub();

    global.Promise = Promise;

    requireRecorder();
  });

  var mockWebkit = function(){
    delete global.AudioContext;
    global.webkitAudioContext = sandbox.stub();
    global.webkitAudioContext.prototype.createGain = sandbox.stub().returns({ 
      connect: sandbox.stub(),
      gain: {
        setTargetAtTime: sandbox.stub()
      }
    });
    global.webkitAudioContext.prototype.createScriptProcessor = sandbox.stub().returns({
      connect: sandbox.stub()
    });
    global.webkitAudioContext.prototype.createMediaStreamSource = sandbox.stub().returns({ 
      connect: sandbox.stub()
    });
    global.webkitAudioContext.prototype.sampleRate = 44100;
    requireRecorder();
  };

  afterEach(function () {
    sandbox.restore();
  });

  it('should support Recording', function () {
    expect(Recorder.isRecordingSupported()).to.be.ok;
  });

  it('should create an instance without config', function () {
    var rec = new Recorder();
    expect(global.AudioContext).to.have.been.calledWithNew;
    expect(rec.state).to.equal('inactive');
    expect(rec.config).to.have.property('bufferLength', 4096);
    expect(rec.config).to.have.property('monitorGain', 0);
    expect(rec.config).to.have.property('numberOfChannels', 1);
    expect(rec.config).to.have.property('encoderSampleRate', 48000);
    expect(rec.config).to.have.property('encoderPath', 'encoderWorker.min.js');
    expect(rec.config).to.have.property('streamPages', false);
    expect(rec.config).to.have.property('leaveStreamOpen', false);
    expect(rec.config).to.have.property('maxBuffersPerPage', 40);
    expect(rec.config).to.have.property('mediaTrackConstraints', true);
    expect(rec.config).to.have.property('monitorGain', 0);
    expect(rec.config).to.have.property('encoderApplication', 2049);
    expect(rec.config).to.have.property('encoderFrameSize', 20);
    expect(rec.config).to.have.property('resampleQuality', 3);
    expect(rec.config).to.have.property('wavBitDepth', 16);
    expect(rec.config).to.have.property('wavSampleRate', 44100);
  });

  it('should support Recording with Safari Webkit', function () {
    mockWebkit();
    expect(Recorder.isRecordingSupported()).to.be.ok;
  });

  it('should create an instance with Safari Webkit', function () {
    mockWebkit();
    var rec = new Recorder();
    expect(global.webkitAudioContext).to.have.been.calledWithNew;
    expect(rec.state).to.equal('inactive');
    expect(rec.config).to.have.property('bufferLength', 4096);
    expect(rec.config).to.have.property('monitorGain', 0);
    expect(rec.config).to.have.property('numberOfChannels', 1);
    expect(rec.config).to.have.property('encoderSampleRate', 48000);
    expect(rec.config).to.have.property('encoderPath', 'encoderWorker.min.js');
    expect(rec.config).to.have.property('streamPages', false);
    expect(rec.config).to.have.property('leaveStreamOpen', false);
    expect(rec.config).to.have.property('maxBuffersPerPage', 40);
    expect(rec.config).to.have.property('mediaTrackConstraints', true);
    expect(rec.config).to.have.property('monitorGain', 0);
    expect(rec.config).to.have.property('encoderApplication', 2049);
    expect(rec.config).to.have.property('encoderFrameSize', 20);
    expect(rec.config).to.have.property('resampleQuality', 3);
    expect(rec.config).to.have.property('wavBitDepth', 16);
    expect(rec.config).to.have.property('wavSampleRate', 44100);
  });

  it('should create an instance with config', function () {
    var rec = new Recorder({
      bufferLength: 2048,
      monitorGain: 100,
      numberOfChannels: 2,
      bitRate: 16000,
      encoderSampleRate: 16000,
      encoderPath: "../dist/encoderWorker.min.js",
      streamPages: true,
      leaveStreamOpen: false,
      maxBuffersPerPage: 1000,
      encoderApplication: 2048,
      encoderFrameSize: 40,
      resampleQuality: 10,
      wavBitDepth: 32
    });

    expect(global.AudioContext).to.have.been.calledWithNew;
    expect(rec.state).to.equal('inactive');
    expect(rec.config).to.have.property('bufferLength', 2048);
    expect(rec.config).to.have.property('monitorGain', 100);
    expect(rec.config).to.have.property('numberOfChannels', 2);
    expect(rec.config).to.have.property('bitRate', 16000);
    expect(rec.config).to.have.property('encoderSampleRate', 16000);
    expect(rec.config).to.have.property('encoderPath', '../dist/encoderWorker.min.js');
    expect(rec.config).to.have.property('streamPages', true);
    expect(rec.config).to.have.property('leaveStreamOpen', false);
    expect(rec.config).to.have.property('maxBuffersPerPage', 1000);
    expect(rec.config).to.have.property('encoderApplication', 2048);
    expect(rec.config).to.have.property('encoderFrameSize', 40);
    expect(rec.config).to.have.property('resampleQuality', 10);
    expect(rec.config).to.have.property('wavBitDepth', 32);
    expect(rec.config).to.have.property('wavSampleRate', 44100);
  });

  it('should initialize a new audio stream', function () {
    var rec = new Recorder();
 
    return rec.initStream().then(function(){
      expect(rec.stream).to.not.be.undefined;
      expect(rec.stream).to.have.property('stop');
      expect(global.navigator.mediaDevices.getUserMedia).to.have.been.calledOnce;
    });

  });

  it('should use the existing audio stream if already initialized', function () {
    var rec = new Recorder();
    return rec.initStream().then(function(){
      return rec.initStream().then(function(){
        expect(rec.stream).to.not.be.undefined;
        expect(rec.stream).to.have.property('stop');
        expect(global.navigator.mediaDevices.getUserMedia).to.have.been.calledOnce;
      });
    });
  });

  it('should clear the audio stream', function () {
    var rec = new Recorder();
    return rec.initStream().then(function(){
      expect(rec.stream).to.not.be.undefined;
      rec.clearStream();
      expect(rec.stream).to.be.undefined;
    });
  });

  it('should clear the audio stream when stream contains tracks', function () {
    var stopTrack1 = sandbox.stub();
    var stopTrack2 = sandbox.stub();
    global.navigator.mediaDevices.getUserMedia = sandbox.stub().resolves({
      getTracks: sandbox.stub().returns([
        { stop: stopTrack1 },
        { stop: stopTrack2 }
      ])
    });

    requireRecorder();
    var rec = new Recorder();
    return rec.initStream().then(function(){
      expect(rec.stream).to.not.be.undefined;
      rec.clearStream();
      expect(stopTrack1).to.have.been.calledOnce;
      expect(stopTrack2).to.have.been.calledOnce;
      expect(rec.stream).to.be.undefined;
    });
  });

  it('should start recording', function () {
    var rec = new Recorder();
    return rec.initStream().then(function(){
      rec.start();
      expect(rec.state).to.equal('recording');
      expect(rec.scriptProcessorNode.connect).to.have.been.calledWith( rec.audioContext.destination );
      expect(rec.onstart).to.have.been.calledOnce;
      expect(rec.encoder.postMessage).to.have.been.calledWithMatch({ command: 'init' });
    });
  });

  it('should stop recording', function () {
    var rec = new Recorder();
    var clearStreamSpy = sinon.spy(rec, 'clearStream');
    return rec.initStream().then(function(){
      rec.start();
      rec.stop();
      expect(rec.state).to.equal('inactive');
      expect(rec.monitorNode.disconnect).to.have.been.calledOnce;
      expect(rec.scriptProcessorNode.disconnect).to.have.been.calledOnce;
      expect(clearStreamSpy).to.have.been.calledOnce;
      expect(rec.encoder.postMessage).to.have.been.calledWithMatch({ command: 'done' });
    });
  });

  it('should stop recording and leave stream open', function () {
    var rec = new Recorder({
      leaveStreamOpen: true
    });
    var clearStreamSpy = sinon.spy(rec, 'clearStream');
    return rec.initStream().then(function(){
      rec.start();
      rec.stop();
      expect(rec.state).to.equal('inactive');
      expect(rec.monitorNode.disconnect).to.have.been.calledOnce;
      expect(rec.scriptProcessorNode.disconnect).to.have.been.calledOnce;
      expect(clearStreamSpy).not.to.have.been.called;
      expect(rec.encoder.postMessage).to.have.been.calledWithMatch({ command: 'done' });
    });
  });

  it('should call initStream promise catch', function () {
    global.navigator.mediaDevices.getUserMedia = () => Promise.reject(new Error('PermissionDeniedError'));
    requireRecorder();
    var rec = new Recorder();
    return rec.initStream().then(() => { 
      throw new Error('Unexpected promise resolving.');
    }, ev => {
      expect(ev).instanceof(Error);
      expect(ev.message).to.equal('PermissionDeniedError')
    })
  });

  it('should set monitoring gain on init', function () {
    var rec = new Recorder();
    return rec.initStream().then(function(){
      expect(rec.monitorNode.gain.setTargetAtTime).to.have.been.calledOnce;
    });
  });

  it('should init worker', function () {
    var rec = new Recorder();
    expect(global.Worker).to.have.been.calledWithNew;
    expect(rec.encoder.addEventListener).to.have.been.calledOnce;
    expect(rec.encoder.addEventListener).to.have.been.calledWith('message');
  });

  it('should re-init worker when storePage completes', function () {
    var rec = new Recorder();
    expect(global.Worker).to.have.been.calledOnce;
    rec.storePage(null);
    expect(global.Worker).to.have.been.calledTwice;
  });

  it('should re-init worker when streamPage completes', function () {
    var rec = new Recorder();
    expect(global.Worker).to.have.been.calledOnce;
    rec.streamPage(null);
    expect(global.Worker).to.have.been.calledTwice;
  });

  it('should share audioContext', function () {
    var rec1 = new Recorder();
    var rec2 = new Recorder();
    expect(rec1.audioContext).to.equal(rec2.audioContext);
  });
});
