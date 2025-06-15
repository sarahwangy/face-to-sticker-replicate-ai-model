import { NextResponse } from "next/server";

if (!process.env.NEXT_PUBLIC_REPLICATE_API_TOKEN) {
  throw new Error("Missing environment variable NEXT_PUBLIC_REPLICATE_API_TOKEN");
}

export async function POST(request: Request) {
  try {
    const apiToken = process.env.NEXT_PUBLIC_REPLICATE_API_TOKEN;
    
    let requestData;
    try {
      requestData = await request.json();
    } catch {
      return NextResponse.json(
        { error: "无效的请求数据" },
        { status: 400 }
      );
    }

    const { image } = requestData;

    if (!image) {
      return NextResponse.json(
        { error: "请提供图片" },
        { status: 400 }
      );
    }

    // 检查并处理图片数据
    let imageData = image;
    if (image.startsWith('data:image')) {
      // 如果是 base64 格式，提取实际的图片数据
      const matches = image.match(/^data:image\/([A-Za-z-+\/]+);base64,(.+)$/);
      if (!matches || matches.length !== 3) {
        return NextResponse.json(
          { error: "无效的图片格式" },
          { status: 400 }
        );
      }
      imageData = matches[2];
    }

    // 创建一个临时的 URL 来验证图片是否可访问
    try {
      const response = await fetch(image);
      if (!response.ok) {
        throw new Error('无法访问图片');
      }
      // 如果是 URL，直接使用 URL
      imageData = image;
    } catch {
      // 如果不是有效的 URL，使用 base64 数据
      // 已经在上面处理过了
    }

    console.log('Sending request to Replicate API...');
    const response = await fetch("https://api.replicate.com/v1/predictions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Token ${apiToken}`,
      },
      body: JSON.stringify({
        version: "764d4827ea159608a07cdde8ddf1c6000019627515eb02b6b449695fd547e5ef",
        input: {
          image: imageData,
        },
      }),
    });

    let responseData;
    try {
      responseData = await response.json();
      console.log('Replicate API response:', responseData);
    } catch {
      console.error('Failed to parse Replicate API response:', await response.text());
      throw new Error('无效的 API 响应');
    }

    if (!response.ok) {
      if (response.status === 422) {
        console.error("Validation error:", responseData);
        return NextResponse.json(
          { 
            error: "图片格式不正确或未检测到人脸",
            details: "请确保：\n1. 上传的是清晰的人脸照片\n2. 照片中有完整的人脸\n3. 人脸角度正面\n4. 照片质量良好"
          },
          { status: 422 }
        );
      }
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
        console.log('Status check response:', statusData);
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
        const errorMessage = statusData.error || "贴纸生成失败";
        throw new Error(errorMessage);
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
    console.error("Error generating sticker:", error);
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : "贴纸生成过程中发生错误",
        details: process.env.NODE_ENV === "development" ? `${error}` : undefined
      },
      { status: 500 }
    );
  }
} 