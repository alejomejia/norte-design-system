'use client'

import { Logo } from '@/components/logo'
import { ToastProvider } from '@/components/toast'

import { signInStyles } from './sign-in.styles'
import { SignInForm, type SignInFormProps } from './sign-in-form'
import { SignInPanel } from './sign-in-panel'

export type SignInPageProps = SignInFormProps

const styles = signInStyles()

/**
 * The page a person signs in or up on: the logo, the form in the middle of its column, and on wide screens a panel
 * with run #128 playing. Built only from Norte's components, so an app can rebuild it from the package.
 */
export function SignInPage(props: SignInPageProps) {
  return (
    <ToastProvider>
      <div className={styles.page()}>
        <main className={styles.main()}>
          <header>
            <Logo size="m" animated />
          </header>
          <div className={styles.body()}>
            <div className={styles.column()}>
              <SignInForm {...props} />
            </div>
          </div>
          <footer className={styles.footer()}>© 2026 Norte</footer>
        </main>
        <SignInPanel />
      </div>
    </ToastProvider>
  )
}
