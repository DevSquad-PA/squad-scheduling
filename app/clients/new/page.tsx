"use client";
import React from "react";
import { PhoneInput } from "../../components/PhoneInput";
import styles from "../../../styles/clients/new/page.module.css";

export default function ClientRegisterPage() {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const payload = {
      fullName: String(fd.get("fullName") || ""),
      cpf: String(fd.get("cpf") || ""),
      birthDate: String(fd.get("birthDate") || ""),
      phone: String(fd.get("phone") || ""),
      email: String(fd.get("email") || ""),
    };
    console.log("client submit:", payload);
    // TODO: enviar payload para API
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.card}>
        <h1 className={styles.title}>Cadastro</h1>

        <form className={styles.form} onSubmit={handleSubmit} noValidate>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="fullName">Nome completo</label>
            <input className={styles.input} id="fullName" name="fullName" type="text" placeholder="Nome completo" required />
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="cpf">CPF</label>
            <input
              className={styles.input}
              id="cpf"
              name="cpf"
              type="text"
              inputMode="numeric"
              pattern="[0-9]{11}"
              placeholder="CPF"
              required
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="birthDate">Data de nascimento</label>
            <input className={styles.input} id="birthDate" name="birthDate" type="date" required />
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="phone">Telefone</label>
            <PhoneInput
              className={styles.input}
              id="phone"
              name="phone"
              required
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="email">Email</label>
            <input className={styles.input} id="email" name="email" type="email" placeholder="Email" required />
          </div>

          <div className={styles.actions}>
            <button className={styles.primary} type="submit">Cadastrar</button>
            <button className={styles.secondary} type="button">Voltar ao login</button>
          </div>
        </form>
      </div>
    </div>
  );
}
