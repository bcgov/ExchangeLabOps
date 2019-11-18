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

const OpenShiftClient = require('../lib/OpenShiftClient');
const OpenShiftResourceSelector = require('../lib/OpenShiftResourceSelector');

const PROJECT_TOOLS = 'csnr-devops-lab-tools'
const PROJECT_DEPLOY = 'csnr-devops-lab-deploy'
const stubbed = false

describe.skip('OpenShiftClient (@slow @e2e)', function() {
  this.timeout(80000);
  const oc = new OpenShiftClient({namespace:PROJECT_TOOLS})
  afterEach(function () {
    // completely restore all fakes created through the sandbox
    sandbox.restore();
  });

  it.skip('create - @slow @e2e', function() {
    //return new Promise(()=>{
      var params={NAME:'my-test-app'}
      var fileUrl = oc.toFileUrl(`${__dirname}/resources/bc.template-core.json`)
      
      var processResult= oc.process(fileUrl, {param:params});
      oc.delete(oc.toNamesList(processResult), {'ignore-not-found':'true'})

      expect(processResult).toHaveLength(2)
      var createResult= oc.apply(processResult);
      expect(createResult).toBeInstanceOf(OpenShiftResourceSelector)
      expect(createResult.names().sort()).toEqual([`imagestream.image.openshift.io/${params.NAME}-core`, `buildconfig.build.openshift.io/${params.NAME}-core`].sort())
      expect(createResult.identifiers().sort()).toEqual([`${oc.globalArgs.namespace}/imagestream.image.openshift.io/${params.NAME}-core`, `${oc.globalArgs.namespace}/buildconfig.build.openshift.io/${params.NAME}-core`].sort())

      //var objects = createResult.objects()

      createResult= oc.selector('bc')
      expect(createResult.names()).toEqual(expect.arrayContaining([`buildconfig.build.openshift.io/${params.NAME}-core`]))
      
      createResult= oc.selector('bc', `${params.NAME}-core`)
      expect(createResult.names()).toEqual(expect.arrayContaining([`buildconfig.build.openshift.io/${params.NAME}-core`]))

      createResult.cancelBuild()
      createResult.startBuild({wait:'true'})

      //var deleteResult = createResult.delete()
      //expect(deleteResult.names()).toEqual([`buildconfig.build.openshift.io/${params.NAME}`])
      
    //})//end promise
  }) //end it

  it.skip('process-only - @slow @e2e', function() {
    var params={NAME:'my-test-app'}
    var fileUrl = oc.toFileUrl(`${__dirname}/resources/bc.template.json`)
    
    if (stubbed){
      var stub = sandbox.stub(oc, '_action')
      stub.callsFake(function fakeFn(args, input) {
        return {status:0, stdout:JSON.stringify({kind:'List', items:[{kind:'ImageStream', metadata:{name:params.NAME}}, {kind:'BuildConfig', metadata:{name:params.NAME}}]})}
      });
    }

    
    var processResult= oc.process(fileUrl, {param:params});
    if (stubbed){
      sandbox.assert.calledOnce(oc._action);
    }
    expect(processResult).toHaveLength(4)
    expect(oc.toNamesList(processResult).sort()).toEqual([`ImageStream/${params.NAME}-core`, `BuildConfig/${params.NAME}-core`, `ImageStream/${params.NAME}`, `BuildConfig/${params.NAME}`].sort())
    //stub.resetBehavior();
    //stub.reset()
    //sinon.reset()
  })

  it.skip('process-and-apply - @slow @e2e', function() {
    var params={NAME:'my-test-app'}
    if (stubbed){
      var stub = sandbox.stub(oc, '_action')
      stub.onCall(0).returns({status:0, stdout:JSON.stringify({kind:'List', items:[{kind:'ImageStream', metadata:{name:params.NAME}}, {kind:'BuildConfig', metadata:{name:params.NAME}}]})})
      stub.onCall(1).returns({status:0, stdout:`imagestream.image.openshift.io/${params.NAME}\nbuildconfig.build.openshift.io/${params.NAME}`})
    }

    var fileUrl = oc.toFileUrl(`${__dirname}/examples.template.json`)
    var processResult= oc.process(fileUrl,{param:params});
    expect(processResult).toHaveLength(2)
    var applyResult = oc.apply(processResult, {'dry-run':'true'})
    expect(applyResult).toBeInstanceOf(OpenShiftResourceSelector)
    expect(applyResult.names()).toHaveLength(2)
    expect(applyResult.names()).toEqual([`imagestream.image.openshift.io/${params.NAME}`, `buildconfig.build.openshift.io/${params.NAME}`])
  })
}) //end describe