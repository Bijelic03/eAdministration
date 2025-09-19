"use client";
import Button from "@/components/button";
import Input from "@/components/form/input";
import React, { useState } from "react";

interface FormProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onEdit: (data: any) => void;
}

const UpsertExamRegistrationsForm = ({ data, onEdit }: FormProps) => {

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [formData, setFormData] = useState<any>({
    grade: data?.grade || 0,
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (data?.id) {
      onEdit({...formData, studentid: data?.studentid, id: data?.examid});
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="my-10 flex flex-col gap-y-5 items-center justify-center max-w-[40rem] lg:max-w-[50rem] mx-auto"
    >
      <div className="grid grid-cols-1 gap-5 w-full">
        <Input
          type="number"
          id="grade"
          name="grade"
          value={formData.grade}
          onChange={handleChange}
          placeholder="Ocjena"
          min={5}
          max={10}
          required
        />
      </div>

      <Button
        type="submit"
        className="w-full text-center rounded-[3rem] bg-primary px-6 py-3 mb-3 mt-8 text-white border-1 border-white hover:cursor-pointer transition duration-300 hover:bg-transparent hover:text-yellow-300 hover:border-yellow-300"
      >
        {!data?.id ? "Kreiraj" : "Apdejtuj"}
      </Button>
    </form>
  );
};

export default UpsertExamRegistrationsForm;
