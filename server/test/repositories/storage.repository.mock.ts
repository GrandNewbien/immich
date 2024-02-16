import { IStorageRepository, StorageCore, WatchEvents } from '@app/domain';
import { WatchOptions } from 'chokidar';
import { Mocked } from 'vitest';

interface MockWatcherOptions {
  items?: Array<{ event: 'change' | 'add' | 'unlink' | 'error'; value: string }>;
  close?: () => void;
}

export const makeMockWatcher =
  ({ items, close }: MockWatcherOptions) =>
  (paths: string[], options: WatchOptions, events: Partial<WatchEvents>) => {
    events.onReady?.();
    for (const item of items || []) {
      switch (item.event) {
        case 'add': {
          events.onAdd?.(item.value);
          break;
        }
        case 'change': {
          events.onChange?.(item.value);
          break;
        }
        case 'unlink': {
          events.onUnlink?.(item.value);
          break;
        }
        case 'error': {
          events.onError?.(new Error(item.value));
        }
      }
    }
    return () => close?.();
  };

export const newStorageRepositoryMock = (reset = true): Mocked<IStorageRepository> => {
  if (reset) {
    StorageCore.reset();
  }

  return {
    createZipStream: vi.fn(),
    createReadStream: vi.fn(),
    readFile: vi.fn(),
    writeFile: vi.fn(),
    unlink: vi.fn(),
    unlinkDir: vi.fn().mockResolvedValue(true),
    removeEmptyDirs: vi.fn(),
    checkFileExists: vi.fn(),
    mkdirSync: vi.fn(),
    checkDiskUsage: vi.fn(),
    readdir: vi.fn(),
    stat: vi.fn(),
    crawl: vi.fn(),
    rename: vi.fn(),
    copyFile: vi.fn(),
    utimes: vi.fn(),
    watch: vi.fn().mockImplementation(makeMockWatcher({})),
  };
};
