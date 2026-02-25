import { NextRequest, NextResponse } from "next/server";

// 環境変数の設定 
const DIFY_API_KEY = process.env.DIFY_API_WORKFLOW_KEY 
const endpoint = `${process.env.DIFY_API_URL}/workflows/run` 
export async function POST(request: NextRequest) { 
    try { 
        const body = await request.json(); 
        const { query } = body; 
        
        const response = await fetch(endpoint, { 
            method: 'POST', 
            headers: { 
                'Content-Type': 'application/json', 
                'Authorization': `Bearer ${DIFY_API_KEY}`, 
            }, 
            body: JSON.stringify({
                inputs: {
                    query: query 
                }, 
                response_mode: 'blocking', // ブロッキングモード 
                user: 'user-123' 
            })
        })
            // 成功レスポンスの処理 
        const data = await response.json() 
        console.log(data) 
            // Difyワークフローの出力変数を取得 
        const outputText = data.data.outputs.result 
        
        return NextResponse.json(outputText) 
    } catch (error) {
        console.error('API error:', error) 
        return NextResponse.json('Dify側でエラーが発生しました') 
    }
}