/**
 * 简墨简历 - 高质量中文预设简历数据
 * 包含：技术研发、产品增长、2026 届应届生 3 套完整范例
 */
window.JIANMO_PRESETS = {
  tech: {
    label: '技术研发（高级前端 / 全栈）',
    data: {
      meta: {
        template: 'tech-minimal',
        accent: '#1e3a8a',
        fontSize: 13.5,
        lineHeight: 1.55,
        pagePadding: 16,
        fontFamily: 'sans'
      },
      profile: {
        name: '陈知行',
        title: '高级前端 / 全栈开发工程师（5年经验）',
        phone: '138-0013-8000',
        email: 'chenzhixing@example.com',
        location: '上海 · 浦东新区',
        website: 'github.com/chenzhixing',
        avatar: '',
        summary: '5 年中大型 Web 应用与低代码平台架构经验，擅长 **TypeScript / React / Next.js / Node.js** 技术栈。主导过千万级 PV 业务的性能专项治理与工程化基建搭建，兼顾产品体验打磨与研发效能提升。'
      },
      sections: [
        {
          id: 'sec-exp-tech',
          title: '工作经历',
          items: [
            {
              id: 'item-t1',
              title: '星云智造科技有限公司',
              subtitle: '高级前端工程师 · 核心工作台研发组',
              date: '2023.04 - 至今',
              location: '上海',
              bullets: [
                '主导下一代可视化数据工作台重构，引入 **虚拟滚动 + Web Worker 增量计算**，十万行级表格渲染帧率稳定在 **60 FPS**，首屏 LCP 从 3.4s 降至 **1.1s**。',
                '设计并落地内部跨项目组件库与 Monorepo 工程规范（Vite + Turborepo），覆盖 6 条业务线，页面复用率提升 **45%**，平均发版构建耗时缩短 **60%**。',
                '搭建基于 Playwright 的核心链路自动化回归与前端错误监控看板，线上 P1 级前端故障率同比下降 **78%**。'
              ]
            },
            {
              id: 'item-t2',
              title: '云帆互动网络有限公司',
              subtitle: '前端开发工程师 · 商业化增长团队',
              date: '2021.07 - 2023.03',
              location: '杭州',
              bullets: [
                '负责 SaaS 营销落地页编辑器与 A/B 实验平台开发，支持拖拽排版与实时数据回传，助力运营活动上线周期从 3 天压缩至 **2 小时**。',
                '优化支付收银台与移动端 H5 资源分包策略，首包体积减少 **52%**，核心下单转化率提升 **4.2%**。'
              ]
            }
          ]
        },
        {
          id: 'sec-proj-tech',
          title: '核心项目',
          items: [
            {
              id: 'item-tp1',
              title: '轻舟 Canvas 协同白板引擎',
              subtitle: '核心架构与渲染负责人',
              date: '2024.01 - 2024.10',
              location: '',
              bullets: [
                '基于 **HTML5 Canvas + CRDT（Yjs）** 实现百人同屏低延迟图形绘制与多端状态同步，离线重连自动合并冲突零丢失。',
                '封装四叉树空间索引碰撞检测与局部脏矩形重绘机制，千级图形节点拖拽延迟控制在 **8ms** 以内。'
              ]
            }
          ]
        },
        {
          id: 'sec-edu-tech',
          title: '教育背景',
          items: [
            {
              id: 'item-te1',
              title: '华东理工大学',
              subtitle: '软件工程 · 本科',
              date: '2017.09 - 2021.06',
              location: '上海',
              bullets: [
                'GPA 3.7 / 4.0（专业前 10%），获校级一等奖学金、全国大学生软件设计大赛二等奖。'
              ]
            }
          ]
        },
        {
          id: 'sec-skill-tech',
          title: '专业技能',
          items: [
            {
              id: 'item-ts1',
              title: '技术栈与工程能力',
              subtitle: '',
              date: '',
              location: '',
              bullets: [
                '**前端核心**：精通 JavaScript (ES6+)、TypeScript、HTML5/CSS3、React 18、Vue 3、Next.js。',
                '**工程与性能**：熟悉 Vite、Webpack、Rollup、Monorepo、WebAssembly 基础及 Core Web Vitals 深度调优。',
                '**全栈与运维**：熟练使用 Node.js、PostgreSQL、Redis、Docker 与 GitHub Actions CI/CD 自动化部署。'
              ]
            }
          ]
        }
      ]
    }
  },

  product: {
    label: '产品运营（产品 / 商业化增长）',
    data: {
      meta: {
        template: 'classic-exec',
        accent: '#0f766e',
        fontSize: 13.5,
        lineHeight: 1.58,
        pagePadding: 17,
        fontFamily: 'sans'
      },
      profile: {
        name: '林夏',
        title: '资深产品经理 · 用户增长与商业化方向',
        phone: '139-1234-5678',
        email: 'linxia.pm@example.com',
        location: '北京 · 朝阳区',
        website: 'linkedin.com/in/linxia-pm',
        avatar: '',
        summary: '4 年 B2C 效率工具与订阅制 SaaS 产品实战经验，擅长从 **0-1 需求挖掘、漏斗数据分析到商业化变现闭环**。主导设计过月活百万级产品的会员订阅体系，推动年度付费渗透率提升 **3.1 个百分点**。'
      },
      sections: [
        {
          id: 'sec-exp-pm',
          title: '工作经历',
          items: [
            {
              id: 'item-p1',
              title: '青禾效率科技有限公司',
              subtitle: '产品经理 · 商业化与增长中心',
              date: '2023.06 - 至今',
              location: '北京',
              bullets: [
                '从零重构「文档智能助手」免费转付费路径，引入 **场景化权益卡点 + 首单限时优惠**，会员次月续费率由 62% 提升至 **76%**，ARR 增长 **¥420 万**。',
                '主导新用户 7 日激活体系改版，拆解 12 个关键行为指标并上线交互式新手引导，次日留存提升 **8.5%**。',
                '协同研发与设计团队推行周度 A/B Test 机制，累计上线 28 项实验，沉淀高转化落地页设计规范。'
              ]
            },
            {
              id: 'item-p2',
              title: '海豚微课教育集团',
              subtitle: '用户产品经理',
              date: '2021.07 - 2023.05',
              location: '北京',
              bullets: [
                '负责学习社区与打卡激励模块，设计「学习积分 + 组队督学」机制，社群周活跃用户数（WAU）翻倍至 **18 万**。',
                '梳理并上线标准化客服工单与 NPS 调研后台，将高频产品问题定位与解决周期缩短 **50%**。'
              ]
            }
          ]
        },
        {
          id: 'sec-proj-pm',
          title: '代表项目',
          items: [
            {
              id: 'item-pp1',
              title: 'AI 会议纪要自动生成插件（0 到 1 上线）',
              subtitle: '产品负责人',
              date: '2024.03 - 2024.09',
              location: '',
              bullets: [
                '完成 35 位高频远程办公用户深度访谈，提炼「一键导出待办清单与飞书/Notion 同步」核心场景。',
                '上线 3 个月获得 **4.8 万** 自然安装用户，周留存达 **41%**，成为团队第二大新增会员来源。'
              ]
            }
          ]
        },
        {
          id: 'sec-edu-pm',
          title: '教育背景',
          items: [
            {
              id: 'item-pe1',
              title: '对外经济贸易大学',
              subtitle: '信息管理与信息系统 · 本科',
              date: '2017.09 - 2021.06',
              location: '北京',
              bullets: [
                '主修数据分析、消费心理学与管理信息系统，获全国高校商业精英挑战赛一等奖。'
              ]
            }
          ]
        },
        {
          id: 'sec-skill-pm',
          title: '核心能力',
          items: [
            {
              id: 'item-ps1',
              title: '方法论与工具',
              subtitle: '',
              date: '',
              location: '',
              bullets: [
                '**产品规划**：熟练使用 Figma、Axure、XMind 输出高保真原型与高质量 PRD 文档。',
                '**数据分析**：精通 SQL、神策/GrowingIO 埋点体系设计与漏斗归因分析，能独立完成 AB 实验评估。',
                '**AI 工作流**：熟悉 Prompt 工程与主流大模型应用场景评估，具备 AI Native 产品设计经验。'
              ]
            }
          ]
        }
      ]
    }
  },

  grad: {
    label: '2026 届应届生 / 校招实习',
    data: {
      meta: {
        template: 'fresh-grad',
        accent: '#4338ca',
        fontSize: 13.5,
        lineHeight: 1.56,
        pagePadding: 16,
        fontFamily: 'sans'
      },
      profile: {
        name: '周予安',
        title: '2026 届本科应届生 · 求职：软件开发 / AI 应用工程师',
        phone: '136-8888-6666',
        email: 'zhouyuan2026@example.com',
        location: '成都 · 期望城市：成都 / 杭州 / 上海',
        website: 'gitee.com/zhouyuan-dev',
        avatar: '',
        summary: '计算机科学与技术专业 2026 届本科生，基础扎实，**具备 2 段互联网研发实习经历**。熟悉 Python、JavaScript/TypeScript 与大模型应用开发，学习自驱力强，能快速融入敏捷研发团队。'
      },
      sections: [
        {
          id: 'sec-edu-grad',
          title: '教育背景',
          items: [
            {
              id: 'item-ge1',
              title: '电子科技大学',
              subtitle: '计算机科学与技术 · 本科（2026 届）',
              date: '2022.09 - 2026.06',
              location: '成都',
              bullets: [
                '**GPA 3.82 / 4.0（专业前 8%）**，连续两年获国家励志奖学金及校一等奖学金。',
                '主修课程：数据结构与算法（95）、操作系统（93）、计算机网络（92）、数据库系统（94）。'
              ]
            }
          ]
        },
        {
          id: 'sec-exp-grad',
          title: '实习经历',
          items: [
            {
              id: 'item-g1',
              title: '智谱云端研发中心',
              subtitle: '软件开发实习生 · 智能客服研发组',
              date: '2025.07 - 2025.10',
              location: '杭州',
              bullets: [
                '参与企业知识库 RAG 检索链路优化，引入混合检索（BM25 + 向量召回）与重排策略，问答准确率提升 **14%**。',
                '使用 React + FastAPI 独立开发内部标注与评测工具界面，帮助算法团队评测效率提升 **2 倍**。'
              ]
            },
            {
              id: 'item-g2',
              title: '蓉城数科软件有限公司',
              subtitle: '后端开发实习生',
              date: '2024.07 - 2024.09',
              location: '成都',
              bullets: [
                '负责数据报表导出微服务接口开发与 SQL 慢查询优化，利用索引重构将百万级分页接口响应耗时从 2.8s 降至 **220ms**。'
              ]
            }
          ]
        },
        {
          id: 'sec-proj-grad',
          title: '校园项目与竞赛',
          items: [
            {
              id: 'item-gp1',
              title: 'CampusFlow 校园智能日程与课程助手',
              subtitle: '项目发起人 & 核心开发（GitHub 320+ Stars）',
              date: '2024.10 - 2025.03',
              location: '',
              bullets: [
                '实现教务课表自动解析、ICS 日历订阅与截止日期邮件提醒功能，服务校内 **1,600+ 名学生**。',
                '全站采用前后端分离与 Docker Compose 一键部署，编写完善单测与开源文档。'
              ]
            }
          ]
        },
        {
          id: 'sec-award-grad',
          title: '荣誉证书与技能',
          items: [
            {
              id: 'item-ga1',
              title: '获奖与语言技能',
              subtitle: '',
              date: '',
              location: '',
              bullets: [
                '**竞赛荣誉**：ICPC 亚洲区域赛铜奖、全国大学生数学建模竞赛省级一等奖。',
                '**技能证书**：CET-6（598 分，可无障碍阅读英文技术文档）、熟练使用 Python / TypeScript / MySQL / Git / Linux。'
              ]
            }
          ]
        }
      ]
    }
  }
};
