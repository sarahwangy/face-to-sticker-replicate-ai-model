export function checkEnvironmentVariables() {
  const requiredEnvVars = ['NEXT_PUBLIC_REPLICATE_API_TOKEN'];
  const missingEnvVars = [];

  console.log('\n=== 环境变量检查 ===');
  
  for (const envVar of requiredEnvVars) {
    const value = process.env[envVar];
    console.log(`${envVar}: ${value ? '✅ 已设置' : '❌ 未设置'}`);
    if (!value) {
      missingEnvVars.push(envVar);
    }
  }

  if (missingEnvVars.length > 0) {
    console.error('\n❌ 错误：以下必需的环境变量未设置：');
    missingEnvVars.forEach(envVar => {
      console.error(`  - ${envVar}`);
    });
    console.error('\n请在 .env.local 文件中设置这些环境变量');
    console.error('示例：');
    missingEnvVars.forEach(envVar => {
      console.error(`${envVar}=your_${envVar.toLowerCase()}_here`);
    });
    console.error('\n');
  } else {
    console.log('\n✅ 所有必需的环境变量都已正确设置\n');
  }
} 