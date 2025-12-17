
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { type EmailOtpType } from '@supabase/supabase-js'
import { getBaseUrl } from '@/lib/url'

export async function GET(request: Request) {
    const { searchParams, origin } = new URL(request.url)
    const code = searchParams.get('code')
    const token_hash = searchParams.get('token_hash')
    const type = searchParams.get('type') as EmailOtpType | null
    // if "next" is in param, use it as the redirect URL
    const next = searchParams.get('next') ?? '/trial'

    if (code) {
        const supabase = await createClient()
        const { error } = await supabase.auth.exchangeCodeForSession(code)
        if (!error) {
            const baseUrl = getBaseUrl()
            return NextResponse.redirect(`${baseUrl}${next}`)
        }

        // Surface the underlying auth error (e.g. identity_already_exists) to the login page.
        const loginUrl = new URL(`${origin}/login`)
        loginUrl.searchParams.set('error', 'AuthCodeError')
        loginUrl.searchParams.set('error_description', error.message)
        // "code" isn't always present on the AuthError type, so we access it safely.
        const errorCode = (error as unknown as { code?: string }).code
        if (errorCode) loginUrl.searchParams.set('error_code', errorCode)
        loginUrl.searchParams.set('next', next)
        return NextResponse.redirect(loginUrl)
    }

    if (token_hash && type) {
        const supabase = await createClient()
        const { error } = await supabase.auth.verifyOtp({
            type,
            token_hash,
        })
        if (!error) {
            // Redirect to dashboard after successful verification
            return NextResponse.redirect(`${origin}${next}`)
        }

        const loginUrl = new URL(`${origin}/login`)
        loginUrl.searchParams.set('error', 'AuthCodeError')
        loginUrl.searchParams.set('error_description', error.message)
        const errorCode = (error as unknown as { code?: string }).code
        if (errorCode) loginUrl.searchParams.set('error_code', errorCode)
        loginUrl.searchParams.set('next', next)
        return NextResponse.redirect(loginUrl)
    }

    // return the user to an error page with instructions
    return NextResponse.redirect(`${origin}/login?error=AuthCodeError`)
}
