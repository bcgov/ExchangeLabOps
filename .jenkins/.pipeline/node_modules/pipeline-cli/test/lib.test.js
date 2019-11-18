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

const fs = require('fs');

module.exports = class LibTest {
  static process(filePath, args) {
    let template = fs.readFileSync(filePath, { encoding: 'utf-8' });
    const templateAsJson = JSON.parse(template);
    const params = Object.assign({}, args.param || {});

    templateAsJson.parameters.forEach((p) => {
      if (params[p.name] != null && p.value != null) {
        params[p.name] = p.value;
      }
    });

    Object.keys(params).forEach((prop) => {
      const value = params[prop];
      if (value != null) {
        const regex = RegExp(`(?<!\\\\)\\$\\{${prop}\\}`, 'gm');
        template = template.replace(regex, value);
      }
    });

    const items = JSON.parse(template).objects;
    /* eslint-disable no-param-reassign */
    items.forEach((item) => {
      if (item.kind === 'BuildConfig') {
        item.kind = 'buildconfig.build.openshift.io';
      } else if (item.kind === 'ImageStream') {
        item.kind = 'imagestream.image.openshift.io';
      }
    });
    /* eslint-enable no-param-reassign */
    return items;
  }
};
