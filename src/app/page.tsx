"use client";

import { useState, useRef } from "react";
import Image from "next/image";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export default function Home() {
  const [imageUrl, setImageUrl] = useState("");
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<{ message: string; details?: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // 检查文件类型
    if (!file.type.startsWith('image/')) {
      setError({ message: "请上传图片文件" });
      return;
    }

    // 检查文件大小
    if (file.size > MAX_FILE_SIZE) {
      setError({ message: "图片大小不能超过 5MB" });
      return;
    }

    try {
      // 将文件转换为 base64
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      setUploadedImage(base64);
      setError(null);
    } catch (err) {
      setError({ 
        message: "图片处理失败",
        details: "请尝试使用其他图片或刷新页面后重试"
      });
    }
  };

  const generateSticker = async () => {
    if (!uploadedImage) {
      setError({ message: "请先上传图片" });
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch("/api/generate-sticker", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
        body: JSON.stringify({ image: uploadedImage }),
      });

      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error(`预期接收 JSON 响应，但收到 ${contentType}`);
      }

      const data = await response.json();
      
      if (!response.ok) {
        if (response.status === 422) {
          throw new Error(data.error || "请确保上传的图片包含清晰的人脸");
        }
        throw new Error(data.error || "贴纸生成失败");
      }

      if (!data.imageUrl) {
        throw new Error("响应中没有图片 URL");
      }

      setImageUrl(data.imageUrl);
    } catch (err) {
      console.error("Error:", err);
      setError({
        message: err instanceof Error ? err.message : "发生未知错误",
        details: err instanceof Error && err.message.includes("人脸") 
          ? "建议：\n1. 确保图片中有清晰的人脸\n2. 尝试使用正面照片\n3. 确保光线充足\n4. 避免使用戴墨镜的照片"
          : undefined
      });
    } finally {
      setLoading(false);
    }
  };

  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };

  return (
    <main className="min-h-screen p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-center mb-8">AI 照片贴纸生成器</h1>
      
      <div className="space-y-6">
        {/* 图片上传区域 */}
        <div className="flex flex-col items-center gap-4">
          <input
            type="file"
            accept="image/jpeg,image/png"
            onChange={handleFileUpload}
            ref={fileInputRef}
            className="hidden"
          />
          
          <div 
            onClick={triggerFileUpload}
            className={`w-full max-w-md aspect-square border-2 border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors p-4 ${
              uploadedImage ? 'border-blue-500' : 'border-gray-300'
            }`}
          >
            {uploadedImage ? (
              <div className="relative w-full h-full">
                <Image
                  src={uploadedImage}
                  alt="上传的图片"
                  fill
                  className="object-contain rounded-lg"
                />
              </div>
            ) : (
              <>
                <svg className="w-12 h-12 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                <p className="text-gray-500">点击上传图片</p>
                <p className="text-sm text-gray-400 mt-1">支持 JPG、PNG 格式，最大 5MB</p>
                <p className="text-sm text-gray-400">请上传包含清晰人脸的照片</p>
              </>
            )}
          </div>

          <button
            onClick={generateSticker}
            disabled={loading || !uploadedImage}
            className="px-6 py-3 bg-blue-500 text-white rounded-lg disabled:bg-gray-300 disabled:cursor-not-allowed hover:bg-blue-600 transition-colors font-medium"
          >
            {loading ? "生成中..." : "生成贴纸"}
          </button>
        </div>

        {error && (
          <div className="text-red-500 p-4 bg-red-50 rounded-lg">
            <p className="font-semibold">{error.message}</p>
            {error.details && (
              <div className="mt-2 text-sm whitespace-pre-wrap text-red-600">
                {error.details}
              </div>
            )}
          </div>
        )}

        {loading && (
          <div className="text-center text-gray-500 p-4 bg-gray-50 rounded-lg">
            <p>正在生成贴纸，请稍候...</p>
            <p className="text-sm mt-2">处理时间可能需要 10-30 秒</p>
          </div>
        )}

        {imageUrl && (
          <div className="relative w-full max-w-md mx-auto aspect-square bg-gray-50 rounded-lg overflow-hidden">
            <Image
              src={imageUrl}
              alt="生成的贴纸"
              fill
              className="object-contain"
              priority
            />
          </div>
        )}
      </div>
    </main>
  );
}
