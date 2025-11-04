"use client";
import { useParams } from "next/navigation";
import LaporanForm from "@/app/dashboard/laporan/_components/laporan-form";

export default function LaporanEditPage() {
  const { id } = useParams<{ id: string }>();
  return (
    <LaporanForm mode="edit" id={id} backHref="/dashboard/laporan" title="Edit Laporan" subtitle="Perbarui data laporan" />
  );
}

