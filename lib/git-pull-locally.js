const simpleGit = require('simple-git');
const os = require('os');
const path = require('path');
const fs = require('fs');

const repoPathLocal = 'my-local-repo';
const repoPathRemote = 'https://github.com/wsierakowski/demo-content.git';

// prototyping...
// this is going to be the init method called on launch:

// fs operations here are synchronous as this is only done once at the launch
// git operations are async as the API is async

// 1. get OS temp directory
const tempdir = path.join(os.tempdir(), repoPathLocal);

// 2. check if directory exists, if not create a new one
let tempdirExists = true;
try {
  fs.accessSync(tempdir, fs.constants.R_OK | fs.constant.W_OK);
} catch (err) {
  if (err.indexOf('ENOENT: no such file or directory') !== -1) {
    tempdirExists = false
  } else {
    throw `Process doesn't have permission to access ${tempdir}.`;
  }
}

if (!tempdirExists) {
  fs.mkdirSync(tempdir);
}

// 3. if directory exists, check if it is git repo
let git = simpleGit(tempdir);
let isGitRepo = true;
git.status(function _gitStatusHandler(err, status) {
  if (err) {
    if (err.indexOf('Not a git repository') !== -1) {
      isGitRepo = false;
    } else {
      throw `Error getting repository status ${err}.`;
    }

    // 5. if it is not a git repo (or a new dir is created), clone the repo
    if (!isGitRepo) {
      git.clone(repoPathRemote, repoPathLocal, function _gitCloneHandler(err, status) {
        if (err) throw `Error cloning repository: ${err}`;
        console.log('Finished cloning repository');
        // TODO return and call final callback here
      });
    } else {
      // 4. if it is existing repo, check if remote is correct, if not throw error
      //git.getRemotes(function _gitGetRemotesHandler(err, remotesList) {
      // compare if remote is correct...
      // 6. if it was a git repo and remote was correct, pull latest force...
      // git.pull('origin', 'master', {'force?'})
    });
    }
  }
});




// Errors:
// 1. Not a git repo:
// fatal: Not a git repository (or any of the parent directories): .git
