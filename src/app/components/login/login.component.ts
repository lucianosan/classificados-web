import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';

@Component({
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
  standalone: false
})
export class LoginComponent {
  mode: 'login' | 'register' = 'login';
  form!: ReturnType<FormBuilder['group']>;
  error = '';
  next = '/';
  info = '';

  constructor(private fb: FormBuilder, private auth: AuthService, private router: Router, private route: ActivatedRoute) {
    this.form = this.fb.group({
      name: [''],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
    const qp = this.route.snapshot.queryParamMap;
    this.next = qp.get('next') || '/';
    if (qp.get('reason') === 'auth') { this.info = 'Faça login para continuar.'; }
  }

  async submit() {
    this.error = '';
    try {
      if (this.mode === 'register') {
        await this.auth.register(this.form.value.name || '', this.form.value.email!, this.form.value.password!);
      } else {
        await this.auth.login(this.form.value.email!, this.form.value.password!);
      }
      this.router.navigate([this.next]);
    } catch (e: any) {
      this.error = e?.message || 'Erro';
    }
  }
}
