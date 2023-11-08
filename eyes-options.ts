import {
  DesktopBrowserInfo,
  ChromeEmulationInfo,
  IOSDeviceInfo,
  DeviceNamePlain,
  ScreenOrientation,
} from '@applitools/eyes-playwright';

export type EyesDevice = {
  deviceName: DeviceNamePlain,
  screenOrientation?: ScreenOrientation | undefined
}

export type EyesBrowserConfig = ( 
  EyesDevice | 
  DesktopBrowserInfo | 
  ChromeEmulationInfo | 
  IOSDeviceInfo 
);

// Applitools objects to share for all tests
export type EyesOptions = {
  batchId?: string;
  batchName?: string;
  appName?: string;
  testName?: string;
  appNameTitlePath?: boolean;
  testNameTitlePath?: boolean;
  titlePathSepatator?: string;
  disableEyes: boolean;
  useUltraFastGrid?: boolean;
  browsers?: EyesBrowserConfig[];
};

export {
  BrowserType,
  ChromeEmulationInfo,
  DesktopBrowserInfo,
  DeviceName,
  IOSDeviceInfo,
  IosDeviceName,
  IosVersion,
  ScreenOrientation
} from '@applitools/eyes-playwright';
