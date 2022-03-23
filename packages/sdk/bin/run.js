#!/usr/bin/env node

import { run, flush, Errors } from '@oclif/core'

import { loadProjectEnv } from '../dist/utils/load-project-env.js'

loadProjectEnv()

run(undefined, import.meta.url)
  .then(flush)
  .catch(Errors.handle)
