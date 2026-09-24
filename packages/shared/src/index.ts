export const appInfo = {
  name: 'ERP',
  version: '0.1.0',
};

export const getSystemStatusSummary = () => ({
  status: 'ok',
  app: appInfo.name,
});
