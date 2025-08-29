import {Component, inject, signal} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {AuthService} from '../services/auth.service';
import {Router} from '@angular/router';

@Component({
  standalone: true,
  selector: 'app-auth-page',
  imports: [CommonModule, FormsModule],
  template: `
    <section class="wrap">
      <div class="card">
        <h1 class="title">Willkommen auf dem Marktplatz!</h1>
        <div class="tabs">
          <button type="button"
                  [class.active]="mode()==='login'"
                  (click)="setMode('login')">Anmelden
          </button>
          <button type="button"
                  [class.active]="mode()==='register'"
                  (click)="setMode('register')">Registrieren
          </button>
        </div>
        <section *ngIf="mode()==='login'" class="pane">
          <label class="lbl">E-Mail
            <input class="inp" type="email" [(ngModel)]="logEmail"/>
          </label>

          <label class="lbl">Passwort
            <input class="inp" type="password" [(ngModel)]="logPwd"/>
          </label>

          <button class="primary" (click)="login()" [disabled]="busy()">Einloggen</button>

          <p class="ok" *ngIf="okLogin()">{{ okLogin() }}</p>
          <p class="err" *ngIf="errLogin()">{{ errLogin() }}</p>

          <p class="alt">
            Noch kein Konto?
            <a class="switch" (click)="toggle()">Jetzt registrieren</a>
          </p>
        </section>
        <section *ngIf="mode()==='register'" class="pane">
          <label class="lbl">E-Mail
            <input class="inp" type="email" [(ngModel)]="regEmail"/>
          </label>

          <label class="lbl">Passwort
            <input class="inp" type="password" [(ngModel)]="regPwd"/>
          </label>
          <button class="primary" (click)="register()" [disabled]="busy()">Konto erstellen</button>
          <p class="ok" *ngIf="ok()">{{ ok() }}</p>
          <p class="err" *ngIf="err()">{{ err() }}</p>

          <p class="alt">
            Schon ein Konto?
            <a class="switch" (click)="toggle()">Zum Login</a>
          </p>
        </section>
      </div>
    </section>
  `,
  styles: [`
    .wrap {
      min-height: 100dvh;
      display: grid;
      place-items: center;
      padding: 2rem 1rem;
      color: var(--ink);
      background: radial-gradient(1100px 520px at 8% -10%, #fff4f8 0%, transparent 60%),
      radial-gradient(900px 520px at 110% 120%, #eef7ef 0%, transparent 60%),
      var(--bg);
    }

    .card {
      width: min(600px, 100%);
      background: var(--card);
      border: 1px solid var(--accent);
      border-radius: 16px;
      box-shadow: var(--shadow);
      padding: 1.2rem 1.1rem 1.1rem;
    }

    .title {
      margin: 0 0 .75rem 0;
      text-align: center;
      font-family: "Playfair Display", serif;
      font-size: clamp(1.6rem, 2.6vw, 2.1rem);
      color: var(--ink);
      letter-spacing: .2px;
    }

    .tabs {
      display: flex;
      gap: .5rem;
      padding: .25rem;
      width: max-content;
      margin: 0 auto 1rem;
      background: #fff;
      border: 1px solid var(--accent);
      border-radius: 999px;
    }

    .tabs button {
      border: none;
      background: transparent;
      color: var(--muted);
      padding: .5rem .9rem;
      border-radius: 999px;
      cursor: pointer;
      font-weight: 600;
      transition: background .15s ease, transform .05s ease;
    }

    .tabs button:hover {
      transform: translateY(-1px);
    }

    .tabs button.active {
      background: var(--accent-2);
      color: var(--ink);
      border: 1px solid #cfe3d1;
      box-shadow: var(--shadow);
    }

    .pane {
      display: grid;
      gap: .85rem;
      max-width: 420px;
      margin: 0 auto;
    }

    .lbl {
      display: grid;
      gap: .35rem;
      font-size: .95rem;
      color: var(--ink);
      font-weight: 600;
    }

    .inp {
      width: 100%;
      padding: .65rem .75rem;
      border: 1px solid var(--accent);
      background: #fff;
      border-radius: 10px;
      outline: none;
      transition: box-shadow .15s ease, border-color .15s ease;
      font-size: .95rem;
    }

    .inp:focus {
      border-color: var(--ring);
      box-shadow: 0 0 0 4px rgba(242, 203, 216, .35);
    }

    .primary {
      width: 100%;
      margin-top: .15rem;
      padding: .65rem .8rem;
      border: 1px solid #cfe3d1;
      border-radius: 10px;
      background: var(--accent-2);
      color: var(--ink);
      cursor: pointer;
      box-shadow: var(--shadow);
      font-weight: 600;
    }

    .primary:disabled {
      opacity: .6;
      cursor: not-allowed;
      box-shadow: none;
    }

    .alt {
      text-align: center;
      margin: .25rem 0 0;
      color: var(--muted);
      font-size: .95rem;
    }

    .switch {
      color: var(--ink);
      text-decoration: underline;
      cursor: pointer;
      font-weight: 600;
      margin-left: .25rem;
    }

    .ok {
      margin: .25rem 0 0;
      color: #166534;
      background: #ecfdf5;
      border: 1px solid #a7f3d0;
      padding: .45rem .6rem;
      border-radius: 10px;
      text-align: center;
      font-weight: 600;
    }

    .err {
      margin: .25rem 0 0;
      color: #8b2d2d;
      background: #fde2e2;
      border: 1px solid #f7caca;
      padding: .45rem .6rem;
      border-radius: 10px;
      text-align: center;
      font-weight: 600;
    }
  `]
})
export class AuthPageComponent {
  private auth = inject(AuthService);
  private router = inject(Router);

  mode = signal<'login' | 'register'>('login');

  regEmail = '';
  regPwd = '';
  logEmail = '';
  logPwd = '';

  busy = signal(false);
  ok = signal('');
  err = signal('');
  okLogin = signal('');
  errLogin = signal('');

  setMode(m: 'login' | 'register') {
    this.mode.set(m);
    this.clearMsgs();
  }

  toggle() {
    this.setMode(this.mode() === 'login' ? 'register' : 'login');
  }

  clearMsgs() {
    this.ok.set('');
    this.err.set('');
    this.okLogin.set('');
    this.errLogin.set('');
  }

  login() {
    this.busy.set(true);
    this.clearMsgs();
    this.auth.login(this.logEmail, this.logPwd).subscribe({
      next: () => {
        this.busy.set(false);
        this.router.navigateByUrl('/shop');
      },
      error: () => {
        this.errLogin.set('Login fehlgeschlagen.');
        this.busy.set(false);
      }
    });
  }

  register() {
    this.busy.set(true);
    this.clearMsgs();
    this.auth.register(this.regEmail, this.regPwd).subscribe({
      next: () => {
        this.busy.set(false);
        this.router.navigateByUrl('/shop');
      },
      error: (e) => {
        this.err.set(e?.status === 409 ? 'E-Mail bereits vergeben.' : 'Registrierung fehlgeschlagen.');
        this.busy.set(false);
      }
    });
  }
}
