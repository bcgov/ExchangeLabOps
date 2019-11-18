//
// pipeline-cli
//
// Copyright © 2019 Province of British Columbia
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
// http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
//

'use strict';

/* eslint-disable */

const expect = require('expect');
const sinon = require('sinon');

const sandbox = sinon.createSandbox();

const path = require('path');
const OpenShiftClient = require('../lib/OpenShiftClient');
const OpenShiftResourceSelector = require('../lib/OpenShiftResourceSelector');

const PROJECT_TOOLS = 'csnr-devops-lab-tools';

/* eslint-disable func-names,space-before-function-paren,prefer-arrow-callback,arrow-body-style,prettier/prettier,max-len */

describe('OpenShiftClient - @fast', function() {
  this.timeout(80000);
  const oc = new OpenShiftClient({ namespace: PROJECT_TOOLS });

  afterEach(function() {
    // completely restore all fakes created through the sandbox
    sandbox.restore();
  });

  it('toFileUrl', function() {
    const fileUrl = oc.toFileUrl('./examples.bc.json');
    expect(fileUrl).toMatch(/^file:\/\//);
    expect(() => oc.toFileUrl({})).toThrow();
    expect(oc.toFileUrl('/abc/dev')).toEqual('file:///abc/dev');

    const stub = sandbox.stub(path, 'resolve');
    stub.withArgs("c:\\temp\\temp.json")
    .returns("c:\\temp\\temp.json");

    stub.withArgs("c:/temp/temp.json")
    .returns("c:/temp/temp.json");

    // See https://github.com/BCDevOps/pipeline-cli/pull/5
    expect(oc.toFileUrl('c:\\temp\\temp.json')).toEqual('file://c:/temp/temp.json');
    expect(oc.toFileUrl('c:/temp/temp.json')).toEqual('file://c:/temp/temp.json');
  }); // end it

  it('toFilePath', function() {
    expect(oc.toFilePath('http://somewhere/over/here')).toEqual('http://somewhere/over/here');
    expect(oc.toFilePath('file:///tmp/temp-file.tmp')).toEqual('/tmp/temp-file.tmp');
  }); // end it

  it('namespace', function() {
    expect(oc.namespace()).toEqual(PROJECT_TOOLS);
  });

  it('run', function() {
    expect(() => oc.run()).toThrow();
  });

  it('exec', function() {
    expect(() => oc.exec()).toThrow();
  });

  it('rsh', function() {
    expect(() => oc.rsh()).toThrow();
  });

  it('rsync', function() {
    expect(() => oc.rsync()).toThrow();
  });

  it('tag', function() {
    expect(() => oc.tag()).toThrow();
  });

  it('misc', function() {
    expect(oc.unwrapOpenShiftList({ kind: 'BuildConfig' })).toEqual([{ kind: 'BuildConfig' }]);
    expect(oc.unwrapOpenShiftList({ kind: 'List', items: [{ kind: 'BuildConfig' }] })).toEqual([{ kind: 'BuildConfig' }]);
    expect(() => oc.unwrapOpenShiftList('')).toThrow();

    expect(oc.wrapOpenShiftList({ kind: 'BuildConfig' })).toEqual({
      apiVersion: 'v1',
      items: [{ kind: 'BuildConfig' }],
      kind: 'List',
      metadata: {}
    });

    expect(oc.wrapOpenShiftList([{ kind: 'BuildConfig' }])).toEqual({
      apiVersion: 'v1',
      items: [{ kind: 'BuildConfig' }],
      kind: 'List',
      metadata: {}
    });

    expect(() => oc.toNamesList('')).toThrow();
    expect(oc.toNamesList([{ kind: 'BuildConfig', metadata: { name: 'test' } }])).toEqual(['BuildConfig/test']);
    expect(oc.toNamesList({ kind: 'BuildConfig', metadata: { name: 'test' } })).toEqual(['BuildConfig/test']);
    expect(oc.toNamesList({ kind: 'List', items: [{ kind: 'BuildConfig', metadata: { name: 'test' } }] })).toEqual(['BuildConfig/test']);
    expect(oc.toNamesList({ kind: 'List' })).toEqual([]);


    const oc2 = new OpenShiftClient({ namespace: PROJECT_TOOLS, cwd: '/current/git/top/dir' });
    expect(oc2.namespace()).toEqual(PROJECT_TOOLS);
    expect(oc2.cwd()).toEqual('/current/git/top/dir');
  });

  it('selector', function() {
    const stub = sandbox.stub(oc, '_action');
    stub.onCall(0).returns({ status: 0, stdout: 'buildconfig.build.openshift.io/test' });

    const selector = oc.selector('BuildConfig', 'test');
    expect(selector.names()).toEqual(['buildconfig.build.openshift.io/test']);
  });

  describe('buildCommonArgs', function() {
    it('no namespace (global namespace)', function() {
      const fileUrl = oc.toFileUrl('./examples.bc.json');
      expect(oc.buildCommonArgs('create', { filename: fileUrl, param: ['NAME=abc'] }, { output: 'json' }, { output: 'name' })).toEqual([`--namespace=${oc.globalArgs.namespace}`, 'create', `--filename=${fileUrl}`, '--param=NAME=abc', '--output=name']);
    });

    it('override namespace', function() {
      const fileUrl = oc.toFileUrl('./examples.bc.json');
      // var filePath = oc.toFilePath(fileUrl)
      expect(oc.buildCommonArgs('create', { filename: fileUrl }, { output: 'json' }, { output: 'name', namespace: 'override-namespace' })).toEqual(['--namespace=override-namespace', 'create', `--filename=${fileUrl}`, '--output=name']);
    });

    it('verb namespace', function() {
      const fileUrl = oc.toFileUrl('./examples.bc.json');
      // var filePath = oc.toFilePath(fileUrl)
      expect(oc.buildCommonArgs('create', { filename: fileUrl, namespace: 'verb-namespace' }, { output: 'json' }, { output: 'name' })).toEqual(['--namespace=verb-namespace', 'create', `--filename=${fileUrl}`, '--output=name']);
    });

    it('user namespace', function() {
      const fileUrl = oc.toFileUrl('./examples.bc.json');
      // var filePath = oc.toFilePath(fileUrl)
      expect(oc.buildCommonArgs('create', { filename: fileUrl }, { output: 'json', namespace: 'user-namespace' }, { output: 'name' })).toEqual(['--namespace=user-namespace', 'create', `--filename=${fileUrl}`, '--output=name']);
    });

    it('user + override namespace', function() {
      const fileUrl = oc.toFileUrl('./examples.bc.json');
      // var filePath = oc.toFilePath(fileUrl)
      expect(oc.buildCommonArgs('create', { filename: fileUrl }, { output: 'json', namespace: 'user-namespace' }, { output: 'name', namespace: 'override-namespace' })).toEqual(['--namespace=override-namespace', 'create', `--filename=${fileUrl}`, '--output=name']);
    });

    it('user + verb namespace', function() {
      const fileUrl = oc.toFileUrl('./examples.bc.json');
      // var filePath = oc.toFilePath(fileUrl)
      expect(oc.buildCommonArgs('create', { filename: fileUrl, namespace: 'verb-namespace' }, { output: 'json', namespace: 'user-namespace' }, { output: 'name' })).toEqual(['--namespace=verb-namespace', 'create', `--filename=${fileUrl}`, '--output=name']);
    });

    it('verb, user, and override namespaces', function() {
      const fileUrl = oc.toFileUrl('./examples.bc.json');
      // var filePath = oc.toFilePath(fileUrl)
      expect(oc.buildCommonArgs('create', { filename: fileUrl, namespace: 'verb-namespace' }, { output: 'json', namespace: 'user-namespace' }, { output: 'name', namespace: 'override-namespace' })).toEqual(['--namespace=override-namespace', 'create', `--filename=${fileUrl}`, '--output=name']);
    });
  });

  it('oc-whoami', function() {
    var stub = sandbox.stub(oc, '_action')
    //process
    stub.onCall(0).returns({status:0, stdout: 'username'})
    stub.onCall(1).throws(new Error('Error: unknown command'))

    const proc = oc._action(['whoami'], 'ignored-stdin');
    expect(proc.status).toEqual(0);
    expect(() => oc._action(['who-am-i'])).toThrow();
  });

  it('create', function() {
    // var spy = sandbox.spy(oc, '_action')

    const stub = sandbox.stub(oc, '_action');
    const params = { NAME: 'my-test-app' };

    const template1Result = { apiVersion: 'v1', kind: 'List', items: [{ kind: 'ImageStream', metadata: { name: params.NAME }, spec: { } }, { kind: 'BuildConfig', metadata: { name: params.NAME } }] };
    
    stub.withArgs(
      ['--namespace=csnr-devops-lab-tools', 'process', '-f', `${__dirname}/resources/bc.template-core.json`, '--param=NAME=my-test-app', '--output=json']
    ).returns({ status: 0, stdout: JSON.stringify(template1Result) });

    stub.withArgs(
      ["--namespace=csnr-devops-lab-tools","delete","ImageStream/my-test-app","BuildConfig/my-test-app","--ignore-not-found=true","--output=name"]
    ).returns({status:0, stdout:'ImageStream/my-test-app\nBuildConfig/my-test-app'})

    stub.withArgs(
      ["--namespace=csnr-devops-lab-tools","apply","-f","-","--output=name"], JSON.stringify(oc.wrapOpenShiftList(template1Result.items))
    ).returns({status:0, stdout:'imagestream.image.openshift.io/my-test-app-core\nbuildconfig.build.openshift.io/my-test-app-core'})

    stub.withArgs(
      ["--namespace=csnr-devops-lab-tools","create",`--filename=${__dirname}/resources/bc.template-core.json`,"--param=NAME=my-test-app","--output=name"]
    ).returns({status:0, stdout:'imagestream.image.openshift.io/my-test-app-core\nbuildconfig.build.openshift.io/my-test-app-core'})

    stub.withArgs(
      ["--namespace=csnr-devops-lab-tools","replace",`--filename=${__dirname}/resources/bc.template-core.json`,"--param=NAME=my-test-app","--output=name"]
    ).returns({status:0, stdout:'imagestream.image.openshift.io/my-test-app-core\nbuildconfig.build.openshift.io/my-test-app-core'})

    stub.withArgs(
      ["--namespace=csnr-devops-lab-tools","get","bc","--output=name"]
    ).returns({status:0, stdout:'buildconfig.build.openshift.io/my-test-app-core'})

    stub.withArgs(
      ["--namespace=csnr-devops-lab-tools","get","bc","my-test-app-core","--output=name"]
    ).returns({status:0, stdout:'buildconfig.build.openshift.io/my-test-app-core'})
    
    stub.withArgs(
      ["--namespace=csnr-devops-lab-tools","cancel-build","buildconfig.build.openshift.io/my-test-app-core"]
    ).returns({status:0, stdout:''})

    stub.withArgs(
      ["--namespace=csnr-devops-lab-tools","start-build","buildconfig.build.openshift.io/my-test-app-core","--wait=true","--output=name"]
    ).returns({status:0, stdout:'build.build.openshift.io/my-test-app-core-1'})

    //For debugging and capturing not stubbed calls
    stub.callsFake(function fakeFn(args, input) {
      console.log(`${JSON.stringify(args)}, ${JSON.stringify(input)}`);
      throw new Error('Not Implemented');
    });
    
    var fileUrl = oc.toFileUrl(`${__dirname}/resources/bc.template-core.json`)
    
    var createResult = oc.create(fileUrl, {param:params});
    expect(createResult).toBeInstanceOf(OpenShiftResourceSelector)

    var replaceResult = oc.replace(fileUrl, {param:params});
    expect(replaceResult).toBeInstanceOf(OpenShiftResourceSelector)

    var processResult= oc.process(fileUrl, {param:params});
    oc.delete(oc.toNamesList(processResult), {'ignore-not-found':'true'})

    expect(processResult).toHaveLength(2)
    expect(processResult).toEqual(template1Result.items);

    var applyResult= oc.apply(processResult);
    expect(applyResult).toBeInstanceOf(OpenShiftResourceSelector)
    expect(applyResult.names().sort()).toEqual([`imagestream.image.openshift.io/${params.NAME}-core`, `buildconfig.build.openshift.io/${params.NAME}-core`].sort())
    expect(applyResult.identifiers().sort()).toEqual([`${oc.globalArgs.namespace}/imagestream.image.openshift.io/${params.NAME}-core`, `${oc.globalArgs.namespace}/buildconfig.build.openshift.io/${params.NAME}-core`].sort())

    applyResult= oc.selector('bc')
    expect(applyResult.names()).toEqual(expect.arrayContaining([`buildconfig.build.openshift.io/${params.NAME}-core`]))
    
    applyResult= oc.selector('bc', `${params.NAME}-core`)
    expect(applyResult.names()).toEqual(expect.arrayContaining([`buildconfig.build.openshift.io/${params.NAME}-core`]))

    applyResult.cancelBuild()
    applyResult.startBuild({wait:'true'})
  }) //end it

  it('process', function() {
    var params={NAME:'my-test-app'}
    expect(()=>oc.process({}, {param:params})).toThrow()
    expect(()=>oc.process('not/a/url', {param:params})).toThrow()
  })
  it('process-only', function() {
    var params={NAME:'my-test-app'}
    var fileUrl = oc.toFileUrl(`${__dirname}/resources/bc.template-core.json`)    
    var stub = sandbox.stub(oc, '_action')
    stub.callsFake(function fakeFn(args, input) {
      return {status:0, stdout:JSON.stringify({kind:'List', items:[{kind:'ImageStream', metadata:{name:`${params.NAME}-core`}}, {kind:'BuildConfig', metadata:{name:`${params.NAME}-core`}}]})}
    });

    var processResult= oc.process(fileUrl, {param:params});
    sandbox.assert.calledOnce(oc._action);
    expect(processResult).toHaveLength(2)
    expect(oc.toNamesList(processResult).sort()).toEqual([`ImageStream/${params.NAME}-core`, `BuildConfig/${params.NAME}-core`].sort())
  })

  it('process-and-apply', function() {
    var params={NAME:'my-test-app'}
    var stub = sandbox.stub(oc, '_action')
    //process
    stub.onCall(0).returns({status:0, stdout:JSON.stringify({kind:'List', items:[{kind:'ImageStream', metadata:{name:params.NAME}, spec: {} }, {kind:'BuildConfig', metadata:{name:params.NAME}}]})})
    //apply
    stub.onCall(1).returns({status:0, stdout:`imagestream.image.openshift.io/${params.NAME}\nbuildconfig.build.openshift.io/${params.NAME}`})
    //delete
    stub.onCall(2).returns({status:0, stdout:`imagestream.image.openshift.io/${params.NAME}\nbuildconfig.build.openshift.io/${params.NAME}`})

    var fileUrl = oc.toFileUrl(`${__dirname}/examples.template.json`)
    var processResult= oc.process(fileUrl,{param:params});
    expect(processResult).toHaveLength(2)
    var applyResult = oc.apply(processResult, {'dry-run':'true'})
    expect(applyResult).toBeInstanceOf(OpenShiftResourceSelector)
    expect(applyResult.names()).toHaveLength(2)
    expect(applyResult.names()).toEqual([`imagestream.image.openshift.io/${params.NAME}`, `buildconfig.build.openshift.io/${params.NAME}`])
    var deleteResult = applyResult.delete()
    expect(deleteResult.names()).toHaveLength(2)
  });
}); // end describe
