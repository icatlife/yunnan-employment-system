const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  // 插入减少类型
  const reduceTypes = [
    { code: 'CLOSE_BANKRUPT', name: '关闭破产', sort_order: 1 },
    { code: 'SUSPEND_RECTIFY', name: '停业整顿', sort_order: 2 },
    { code: 'ECONOMIC_LAYOFF', name: '经济性裁员', sort_order: 3 },
    { code: 'BUSINESS_TRANSFER', name: '业务转移', sort_order: 4 },
    { code: 'NATURAL_ATTRITION', name: '自然减员', sort_order: 5 },
    { code: 'CONTRACT_TERMINATION', name: '正常解除或终止劳动合同', sort_order: 6 },
    { code: 'INTERNATIONAL_FACTOR', name: '国际因素变化影响', sort_order: 7 },
    { code: 'NATURAL_DISASTER', name: '自然灾害', sort_order: 8 },
    { code: 'MAJOR_EVENT', name: '重大事件影响', sort_order: 9 },
    { code: 'OTHER', name: '其他', sort_order: 10 },
  ]

  for (const type of reduceTypes) {
    await prisma.dictReduceType.upsert({
      where: { code: type.code },
      update: {},
      create: type,
    })
  }

  // 插入减少原因
  const reduceReasons = [
    { code: 'IND_ADJUST', name: '产业结构调整', parent_code: null, sort_order: 1 },
    { code: 'TECH_REFORM', name: '重大技术改革', parent_code: null, sort_order: 2 },
    { code: 'ENERGY_SAVING', name: '节能减排、淘汰落后产能', parent_code: null, sort_order: 3 },
    { code: 'ORDER_SHORT', name: '订单不足', parent_code: null, sort_order: 4 },
    { code: 'RAW_MATERIAL_UP', name: '原材料涨价', parent_code: null, sort_order: 5 },
    { code: 'COST_UP', name: '工资、社保等用工成本上升', parent_code: null, sort_order: 6 },
    { code: 'FUND_DIFFICULT', name: '经营资金困难', parent_code: null, sort_order: 7 },
    { code: 'TAX_CHANGE', name: '税收政策变化', parent_code: null, sort_order: 8 },
    { code: 'SEASONAL', name: '季节性用工', parent_code: null, sort_order: 9 },
    { code: 'OTHER_REASON', name: '其他', parent_code: null, sort_order: 10 },
    { code: 'INTERNATIONAL_FACTOR_REASON', name: '国际因素变化', parent_code: 'INTERNATIONAL_FACTOR', sort_order: 11 },
    { code: 'SELF_QUIT', name: '自行离职', parent_code: 'OTHER', sort_order: 12 },
    { code: 'JOB_TRANSFER', name: '工作调动、企业内部调剂', parent_code: 'OTHER', sort_order: 13 },
    { code: 'LABOR_TRANSFER', name: '劳动关系转移、劳务派遣', parent_code: 'OTHER', sort_order: 14 },
    { code: 'HIRING_DIFFICULT', name: '招不上人来', parent_code: 'OTHER', sort_order: 15 },
    { code: 'RETIRE', name: '退休', parent_code: 'NATURAL_ATTRITION', sort_order: 16 },
    { code: 'RESIGN', name: '退职', parent_code: 'NATURAL_ATTRITION', sort_order: 17 },
    { code: 'DEATH', name: '死亡', parent_code: 'NATURAL_ATTRITION', sort_order: 18 },
    { code: 'NATURAL_ATTRITION_REASON', name: '自然减员', parent_code: 'NATURAL_ATTRITION', sort_order: 19 },
  ]

  for (const reason of reduceReasons) {
    await prisma.dictReduceReason.upsert({
      where: { code: reason.code },
      update: {},
      create: reason,
    })
  }

  console.log('Seed 数据插入完成！')
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })