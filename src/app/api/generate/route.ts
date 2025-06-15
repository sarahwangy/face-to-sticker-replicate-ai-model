import { NextResponse } from "next/server";

// if (!process.env.REPLICATE_API_TOKEN) {
//   throw new Error("Missing environment variable REPLICATE_API_TOKEN");
// }

// 这是一个处理POST请求的API路由处理函数
export async function POST(request: Request) {
  try {
    // 从环境变量获取Replicate API令牌
    const apiToken = process.env.NEXT_PUBLIC_REPLICATE_API_TOKEN;
    console.log("server-side token:", apiToken);
    
    // 检查API令牌是否存在
    if (!apiToken) {
      return NextResponse.json(
        { error: "Missing Replicate API token" },
        { status: 500 }
      );
    }

    // 解析请求体中的JSON数据
    let requestData;
    try {
      requestData = await request.json();
    } catch {
      return NextResponse.json(
        { error: "无效的请求数据" },
        { status: 400 }
      );
    }

    // 从请求数据中获取prompt参数
    const { prompt } = requestData;

    // 验证prompt是否存在
    if (!prompt) {
      return NextResponse.json(
        { error: "请提供图片描述" },
        { status: 400 }
      );
    }

    // 调用Replicate API生成图片
    const response = await fetch("https://api.replicate.com/v1/predictions", {
      method: "POST",
      headers: {
        Authorization: `Token ${apiToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        version: "ac732df83cea7fff18b8472768c88ad041fa750ff7682a21affe81863cbe77e4", // 模型版本
        input: {
          prompt: prompt, // 图片描述
          negative_prompt: "ugly, blurry, poor quality, distorted", // 负面提示词
          num_inference_steps: 30, // 推理步数
        },
      }),
    });

    // 解析API响应
    let responseData;
    try {
      responseData = await response.json();
    } catch {
      console.error('Failed to parse Replicate API response:', await response.text());
      throw new Error('无效的 API 响应');
    }

    // 检查响应状态
    if (!response.ok) {
      console.error("Replicate API error:", responseData);
      throw new Error(
        `Replicate API error: ${response.status} ${response.statusText}`
      );
    }

    const predictionId = responseData.id;
    if (!predictionId) {
      throw new Error("No prediction ID returned from Replicate");
    }

    // 轮询获取生成结果
    let imageUrl = null;
    let attempts = 0;
    const maxAttempts = 30; // 最多等待30秒

    while (!imageUrl && attempts < maxAttempts) {
      const statusResponse = await fetch(
        `https://api.replicate.com/v1/predictions/${predictionId}`,
        {
          headers: {
            Authorization: `Token ${apiToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      let statusData;
      try {
        statusData = await statusResponse.json();
      } catch {
        console.error('Failed to parse status response:', await statusResponse.text());
        throw new Error('获取状态时发生错误');
      }

      if (!statusResponse.ok) {
        console.error("Status check error:", statusData);
        throw new Error("获取生成状态失败");
      }

      if (statusData.status === "succeeded") {
        imageUrl = statusData.output?.[0];
        if (!imageUrl) {
          throw new Error("No image URL in the response");
        }
        break;
      } else if (statusData.status === "failed") {
        throw new Error(statusData.error || "图片生成失败");
      }

      attempts++;
      // 等待1秒后再次查询
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    if (!imageUrl) {
      throw new Error("生成超时，请重试");
    }

    return NextResponse.json({ imageUrl });
  } catch (error) {
    console.error("Error generating image:", error);
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : "图片生成过程中发生错误",
        details: process.env.NODE_ENV === "development" ? `${error}` : undefined
      },
      { status: 500 }
    );
  }
} 