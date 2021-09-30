const core = require('@actions/core');
const SentryCli = require('@sentry/cli');
const run = require('../src/create-release');

jest.mock('@actions/core');
jest.mock('@sentry/cli', () => jest.fn());

describe('create-release', () => {
  test('No releaseNamePrefix', async () => {
    const finalize = jest.fn().mockResolvedValue('done');
    const newMock = jest.fn().mockResolvedValue('done');
    const setCommits = jest.fn().mockResolvedValue('done');
    const getPath = jest.fn().mockReturnValue('sentryCliPath');
    const repo = 'repo';

    SentryCli.mockImplementation(() => {
      return {
        releases: {
          finalize,
          new: newMock,
          setCommits,
        },
      };
    });
    SentryCli.getPath = getPath;
    core.getInput.mockReturnValueOnce('refs/tags/v1.0.0').mockReturnValueOnce('qa');

    await run();

    expect(newMock).toHaveBeenCalledTimes(1);
    expect(newMock).toHaveBeenCalledWith('v1.0.0');

    expect(setCommits).toHaveBeenCalledTimes(1);
    expect(setCommits).toHaveBeenCalledWith('v1.0.0', {
      repo,
      auto: true,
    });

    expect(finalize).toHaveBeenCalledTimes(1);
    expect(finalize).toHaveBeenCalledWith('v1.0.0');

    expect(core.setFailed).toHaveBeenCalledTimes(0);
  });

  test('releaseNamePrefix set', async () => {
    const finalize = jest.fn().mockResolvedValue('done');
    const newMock = jest.fn().mockResolvedValue('done');
    const setCommits = jest.fn().mockResolvedValue('done');
    const getPath = jest.fn().mockReturnValue('sentryCliPath');
    const repo = 'repo';

    SentryCli.mockImplementation(() => {
      return {
        releases: {
          finalize,
          new: newMock,
          setCommits,
        },
      };
    });
    SentryCli.getPath = getPath;
    core.getInput
      .mockReturnValueOnce('refs/tags/v1.0.0')
      .mockReturnValueOnce('qa')
      .mockReturnValueOnce('myAwesomeProject-');

    await run();

    expect(newMock).toHaveBeenCalledTimes(1);
    expect(newMock).toHaveBeenCalledWith('myAwesomeProject-v1.0.0');

    expect(setCommits).toHaveBeenCalledTimes(1);
    expect(setCommits).toHaveBeenCalledWith('myAwesomeProject-v1.0.0', {
      repo,
      auto: true,
    });

    expect(finalize).toHaveBeenCalledTimes(1);
    expect(finalize).toHaveBeenCalledWith('myAwesomeProject-v1.0.0');

    expect(core.setFailed).toHaveBeenCalledTimes(0);
  });

  test('Action fails', async () => {
    SentryCli.mockImplementation(() => {
      throw new Error('doh, something failed');
    });

    await run();

    expect(core.setFailed).toHaveBeenCalledTimes(1);
    expect(core.setFailed).toHaveBeenCalledWith('doh, something failed');
  });
});
