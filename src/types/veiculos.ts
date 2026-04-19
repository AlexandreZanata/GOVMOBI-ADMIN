/**
 * Input for creating a new vehicle.
 */
export interface CreateVeiculoInput {
  /** Brazilian license plate (Mercosul format: ABC1D23). */
  placa: string;
  /** Vehicle model description. */
  modelo: string;
  /** Manufacturing year. */
  ano: number;
}

/**
 * Input for updating an existing vehicle.
 */
export interface UpdateVeiculoInput {
  /** Updated vehicle model description. */
  modelo?: string;
  /** Updated manufacturing year. */
  ano?: number;
}

/**
 * Input for fetching a vehicle by ID.
 */
export interface GetVeiculoByIdInput {
  /** Vehicle identifier. */
  id: string;
}
