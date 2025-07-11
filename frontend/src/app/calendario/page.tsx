"use client"

import { useState } from "react"
import { addDays, setHours, setMinutes, subDays } from "date-fns"

import {
  EventCalendar,
  type CalendarEvent,
} from "@/components/event-calendar"

// Eventos específicos para o contexto agrícola
const agronexusEvents: CalendarEvent[] = [
  {
    id: "1",
    title: "Vacinação do Rebanho",
    description: "Aplicação de vacinas contra febre aftosa",
    start: addDays(new Date(), 2), // 2 dias a partir de hoje
    end: addDays(new Date(), 2),
    allDay: true,
    color: "emerald",
    location: "Pasto Norte",
  },
  {
    id: "2",
    title: "Controle Reprodutivo",
    description: "Verificação de prenhez e coberturas",
    start: setMinutes(setHours(addDays(new Date(), 5), 8), 0), // 8:00 AM, 5 dias a partir de hoje
    end: setMinutes(setHours(addDays(new Date(), 5), 12), 0), // 12:00 PM, 5 dias a partir de hoje
    color: "rose",
    location: "Curral Central",
  },
  {
    id: "3",
    title: "Análise Financeira Mensal",
    description: "Revisão dos custos e receitas do mês",
    start: setMinutes(setHours(addDays(new Date(), 7), 14), 0), // 2:00 PM, 7 dias a partir de hoje
    end: setMinutes(setHours(addDays(new Date(), 7), 16), 0), // 4:00 PM, 7 dias a partir de hoje
    color: "amber",
    location: "Escritório",
  },
  {
    id: "4",
    title: "Manejo de Pastagem",
    description: "Rotação de pastagens e avaliação nutricional",
    start: addDays(new Date(), 10), // 10 dias a partir de hoje
    end: addDays(new Date(), 10),
    allDay: true,
    color: "sky",
    location: "Pasto Sul",
  },
  {
    id: "5",
    title: "Desmame dos Bezerros",
    description: "Separação dos bezerros para desmame",
    start: setMinutes(setHours(addDays(new Date(), 14), 7), 0), // 7:00 AM, 14 dias a partir de hoje
    end: setMinutes(setHours(addDays(new Date(), 14), 11), 0), // 11:00 AM, 14 dias a partir de hoje
    color: "violet",
    location: "Curral de Desmame",
  },
  {
    id: "6",
    title: "Tratamento Sanitário",
    description: "Aplicação de vermífugos e medicamentos",
    start: setMinutes(setHours(addDays(new Date(), 17), 9), 0), // 9:00 AM, 17 dias a partir de hoje
    end: setMinutes(setHours(addDays(new Date(), 17), 13), 0), // 1:00 PM, 17 dias a partir de hoje
    color: "orange",
    location: "Curral Central",
  },
  {
    id: "7",
    title: "Pesagem dos Animais",
    description: "Controle de peso e ganho de peso",
    start: setMinutes(setHours(addDays(new Date(), 21), 6), 0), // 6:00 AM, 21 dias a partir de hoje
    end: setMinutes(setHours(addDays(new Date(), 21), 10), 0), // 10:00 AM, 21 dias a partir de hoje
    color: "emerald",
    location: "Balança",
  },
]

export default function CalendarioPage() {
  const [events, setEvents] = useState<CalendarEvent[]>(agronexusEvents)

  const handleEventAdd = (event: CalendarEvent) => {
    setEvents([...events, event])
  }

  const handleEventUpdate = (updatedEvent: CalendarEvent) => {
    setEvents(
      events.map((event) =>
        event.id === updatedEvent.id ? updatedEvent : event
      )
    )
  }

  const handleEventDelete = (eventId: string) => {
    setEvents(events.filter((event) => event.id !== eventId))
  }

  return (
    <div className="flex flex-col space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Calendário Agrícola</h1>
          <p className="text-muted-foreground">
            Gerencie suas atividades pecuárias e eventos da fazenda
          </p>
        </div>
      </div>
      
      <div className="flex-1 min-h-0">
        <EventCalendar
          events={events}
          onEventAdd={handleEventAdd}
          onEventUpdate={handleEventUpdate}
          onEventDelete={handleEventDelete}
        />
      </div>
    </div>
  )
}
