"use client";

import { useState } from "react";
import DeleteAppointment from "./DeleteAppointments";
import EditAppointment from "./EditAppointments";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";

import { Pencil } from "lucide-react";

import type { PropsAppointment } from "@/types/appointment/appointments";

type CardProps = {
    appointment: PropsAppointment;
    trigger: React.ReactNode;
};


export default function CardAppointment({
    appointment, trigger
}: CardProps) {




    return (
        <Dialog>
            <DialogTrigger asChild>
                {trigger}
            </DialogTrigger>

            <DialogContent>
                <DialogHeader>
                    <DialogTitle>
                        <div className="flex items-center text-lg">

                            {appointment.cliente}

                            <div className="pl-4">

                                <EditAppointment
                                    appointment={{
                                        professionalId: appointment.professionalId,
                                        id: appointment.id,
                                        data: appointment.data,
                                        hora: appointment.hora,
                                    }}
                                />

                                <DeleteAppointment
                                    appointmentId={appointment.id}
                                />

                            </div>
                        </div>
                    </DialogTitle>
                </DialogHeader>



                <div className="flex flex-col pb-2">
                    <p><strong>Data:</strong> {appointment.data}</p>
                    <p><strong>Hora:</strong> {appointment.hora}</p>
                    <p><strong>Descrição:</strong> {appointment.descricao}</p>
                    <p><strong>Contato:</strong> {
                    appointment.contato? appointment.contato.replace(
                        /^(\d{2})(\d{5})(\d{4})$/,
                        "($1) $2-$3"
                    ): "Sem contato"}</p>
                    <p>
                        <strong>CPF:</strong>{" "}
                        {appointment.cpf
                            ? appointment.cpf.replace(
                                /(\d{3})(\d{3})(\d{3})(\d{2})/,
                                "$1.$2.$3-$4"
                            )
                            : "Sem CPF"}
                    </p>
                    <p><strong>Endereço:</strong> {appointment.endereco}</p>
                </div>


            </DialogContent>
        </Dialog>
    );
}