const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')
const prisma = new PrismaClient()

async function main() {
  const hashedPassword = await bcrypt.hash('123456', 10)

  // 1. 创建企业用户（同时创建关联的企业信息）
  const enterprise = await prisma.enterprise.create({
    data: {
      org_code: 'TEST001',
      name: '测试企业有限公司',
      region_city: '昆明市',
      region_county: '五华区',
      type_level1: '民营企业',
      type_level2: '有限责任公司',
      industry_level1: '制造业',
      industry_level2: '食品制造',
      contact_person: '张三',
      contact_phone: '13800138000',
      filing_status: 'APPROVED',
      user: {
        create: {
          username: 'test_enterprise',
          password: hashedPassword,
          role: 'enterprise',
          status: 'ENABLED'
        }
      }
    }
  })

  // 2. 创建市用户
  await prisma.user.create({
    data: {
      username: 'test_city',
      password: hashedPassword,
      role: 'city',
      city: '昆明市',
      status: 'ENABLED'
    }
  })

  // 3. 创建省用户
  await prisma.user.create({
    data: {
      username: 'test_province',
      password: hashedPassword,
      role: 'province',
      status: 'ENABLED'
    }
  })

  console.log('测试用户创建完成！')
  console.log('企业用户: test_enterprise / 123456')
  console.log('市用户: test_city / 123456')
  console.log('省用户: test_province / 123456')
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })