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

const util = require('../lib/util');

describe('util', () => {
  it('isUrl', () => {
    expect(util.isUrl('http://somewhere.com/over/here')).toEqual(true);
    expect(util.isUrl('https://somewhere.com/over/here')).toEqual(true);
    expect(util.isUrl('file://hostname/over/here')).toEqual(true);
    expect(util.isUrl('file://localhost/over/here')).toEqual(true);
    expect(util.isUrl('file:///over/here')).toEqual(true);
    expect(util.isUrl({})).toEqual(false);
    expect(util.isUrl(' ///over/here')).toEqual(false);
    expect(util.isUrl('/over/here')).toEqual(false);
    expect(util.isUrl('//over/here')).toEqual(false);
  }).timeout(80000); // end it

  it('hashString', () => {
    expect(util.hashString('Hello World')).toEqual('557db03de997c86a4a028e1ebd3a1ceb225be238');
    expect(util.hashString({ message: 'Hello World' })).toEqual(
      '6c0c73c8fdef129c899271509441773cea232ef6'
    );
  }).timeout(80000); // end it

  it('execSync', () => {
    expect(util.execSync('git', ['version'], { cwd: '/tmp', encoding: 'utf-8' }).status).toEqual(0);
  }).timeout(80000);
}); // end describe
