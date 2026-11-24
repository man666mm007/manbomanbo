/**
 * 简墨简历 - 站点与国内收款配置
 * 上线前只需修改本文件中的 payment 字段，然后重新运行 `npm run build` 即可。
 */
window.JIANMO_CONFIG = {
  // 构建离线买断版时，scripts/build.mjs 会自动将其替换为 'offline'
  edition: 'web',
  siteName: '简墨简历',
  tagline: '纯本地运行 · 无水印矢量 A4 PDF · 隐私不上传服务器',
  version: '1.0.0',

  // 国内收款与自动发货配置（留空则自动隐藏对应入口，不影响工具正常使用）
  payment: {
    // 爱发电主页或赞赏/商品链接，例如 'https://afdian.com/a/yourname'
    afdianUrl: 'https://ifdian.net/a/hachimionabeiluduo',
    // 面包多自动发货商品链接，例如 'https://mianbaoduo.com/o/bread/xxxxxx'
    mianbaoduoUrl: '',
    // 闲鱼或微信等人工引导说明，例如 '闲鱼搜「简墨简历离线版」或微信赞赏支持'
    xianyuTip: '如果这份免费工具帮到了你，欢迎支付宝扫码请作者喝杯咖啡，或前往爱发电获取「离线永久单文件版」（一次性买断，双击即用、永不联网）。',
    // 微信收款码图片路径（将图片放到 src/assets/wechat-qr.png 后填写 'assets/wechat-qr.png'）
    wechatQrPath: '',
    // 支付宝收款码图片路径（将图片放到 src/assets/alipay-qr.png 后填写 'assets/alipay-qr.png'）
    alipayQrPath: 'assets/alipay-qr.jpg',
    // 离线永久买断版建议定价展示文案
    proPriceText: '¥14.9'
  },

  seo: {
    title: '简墨简历 - 免费无水印高清 A4 简历生成器 | 纯本地隐私安全',
    description: '简墨简历是一款纯前端本地运行的中文简历制作工具，提供 5 套大厂/商务/学术/应届生专业模板，实时所见即所得，一键导出可选中文字的高清无水印 A4 PDF。',
    keywords: '免费简历制作,无水印简历,程序员简历模板,A4 PDF简历,在线简历生成器,应届生简历'
  }
};
