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

const expect = require('expect');
const OpenShiftClientX = require('../lib/OpenShiftClientX');
const OpenShiftResourceSelector = require('../lib/OpenShiftResourceSelector');

const PROJECT_TOOLS = 'csnr-devops-lab-tools'
const PROJECT_DEPLOY = 'csnr-devops-lab-deploy'

describe.skip('OpenShiftClientX - @e2e', function() {
  this.timeout(999999);
  const oc = new OpenShiftClientX({namespace:PROJECT_TOOLS})

  it('e2e - @e2e', function() {
    var params={NAME:'my-test-app'}

    
    var fileUrl = oc.toFileUrl(`${__dirname}/resources/bc.template.json`)
    var processResult= oc.process(fileUrl,{param:params});
    
    oc.delete(oc.toNamesList(processResult), {'ignore-not-found':'true'})

    expect(processResult).toBeInstanceOf(Array)
    expect(processResult).toHaveLength(4)

    oc.applyBestPractices(oc.wrapOpenShiftList(processResult))
    oc.applyRecommendedLabels(processResult, 'my-test-app', 'dev', '1')
    oc.fetchSecretsAndConfigMaps(processResult)

    var applyResult = oc.apply(processResult)
    expect(applyResult).toBeInstanceOf(OpenShiftResourceSelector)

    expect(applyResult.names()).toEqual([`imagestream.image.openshift.io/${params.NAME}`, `imagestream.image.openshift.io/${params.NAME}-core`, `buildconfig.build.openshift.io/${params.NAME}-core`, `buildconfig.build.openshift.io/${params.NAME}`])
    
    applyResult.narrow('bc').startBuild({wait:'true'})

  }) //end it
}) //end describe