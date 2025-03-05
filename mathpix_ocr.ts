#!/usr/bin/env bun
/**
 * Mathpix OCR 脚本 - TypeScript版本
 * 使用Mathpix API对图像进行OCR识别
 */

import { readFileSync } from 'fs';
import { resolve } from 'path';
import { parse } from 'dotenv';

// 命令行参数解析
const args = process.argv.slice(2);
let imagePath = '';
let textOnly = false;
let outputFormat = 'text';

// 解析命令行参数
for (let i = 0; i < args.length; i++) {
  if (args[i] === '--text-only') {
    textOnly = true;
  } else if (args[i] === '--format' && i + 1 < args.length) {
    outputFormat = args[i + 1];
    i++;
  } else if (!imagePath) {
    imagePath = args[i];
  }
}

// 检查是否提供了图像路径
if (!imagePath) {
  console.error('用法: bun mathpix_ocr.ts <图像文件路径> [--text-only] [--format text|latex|html|json]');
  process.exit(1);
}

// 检查文件扩展名
if (!imagePath.toLowerCase().endsWith('.png') && 
    !imagePath.toLowerCase().endsWith('.jpg') && 
    !imagePath.toLowerCase().endsWith('.jpeg')) {
  console.error('警告：文件可能不是支持的图像格式（PNG、JPG、JPEG）');
}

// 加载环境变量
let apiKey = '';
try {
  const envPath = resolve(process.cwd(), '.env');
  const envFile = readFileSync(envPath, 'utf8');
  const env = parse(envFile);
  apiKey = env.APIKEY || '';
} catch (error) {
  console.error('错误：无法加载.env文件');
}

if (!apiKey) {
  console.error('错误：未找到API密钥，请在.env文件中设置APIKEY');
  process.exit(1);
}

// 将图像编码为base64
function encodeImage(imagePath: string): string {
  try {
    const imageBuffer = readFileSync(imagePath);
    return imageBuffer.toString('base64');
  } catch (error) {
    console.error(`错误：找不到文件 ${imagePath}`);
    process.exit(1);
  }
}

// 从OCR结果中提取纯文本
function extractTextOnly(result: any): string {
  if (result.text && result.text.trim()) {
    return result.text;
  } else if (result.latex_styled && result.latex_styled.trim()) {
    return result.latex_styled;
  } else if (result.latex && result.latex.trim()) {
    return result.latex;
  } else if (result.html && result.html.trim()) {
    // 简单移除HTML标签
    return result.html.replace(/<[^>]+>/g, '');
  } else {
    return JSON.stringify(result, null, 2);
  }
}

// 使用Mathpix API进行OCR
async function ocrWithMathpix(imagePath: string) {
  console.error(`正在处理图像: ${imagePath}`);
  
  // Mathpix API端点
  const url = 'https://api.mathpix.com/v3/text';
  
  // 编码图像
  const imageBase64 = encodeImage(imagePath);
  
  // 准备请求头
  const headers = {
    'app_id': 'app',  // 默认app_id
    'app_key': apiKey,
    'Content-type': 'application/json'
  };
  
  // 准备请求数据
  const data = {
    src: `data:image/png;base64,${imageBase64}`,
    formats: ['text', 'data', 'html'],
    data_options: {
      include_asciimath: true,
      include_latex: true
    }
  };
  
  try {
    // 发送请求
    const response = await fetch(url, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(data)
    });
    
    if (!response.ok) {
      throw new Error(`API请求失败: ${response.status} ${response.statusText}`);
    }
    
    // 解析响应
    const result = await response.json();
    
    // 根据参数决定输出内容
    if (textOnly) {
      console.log(extractTextOnly(result));
      return;
    }
    
    if (outputFormat !== 'text') {
      if (outputFormat === 'latex' && (result.latex_styled || result.latex)) {
        console.log(result.latex_styled || result.latex);
      } else if (outputFormat === 'html' && result.html) {
        console.log(result.html);
      } else if (outputFormat === 'json') {
        console.log(JSON.stringify(result, null, 2));
      }
      return;
    }
    
    // 默认输出全部信息
    console.log('\n===== OCR 结果 =====');
    
    if (result.text) {
      console.log('\n--- 文本 ---');
      console.log(result.text);
    }
    
    if (result.latex_styled || result.latex) {
      console.log('\n--- LaTeX ---');
      console.log(result.latex_styled || result.latex);
    }
    
    if (result.html) {
      console.log('\n--- HTML ---');
      console.log(result.html);
    }
    
    console.log('\n--- 完整响应 ---');
    console.log(JSON.stringify(result, null, 2));
    
  } catch (error) {
    console.error(`错误：${error.message}`);
    process.exit(1);
  }
}

// 执行OCR
ocrWithMathpix(imagePath); 