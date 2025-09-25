module sar_logic (
    input wire clk_comp,        // Clock from dynamic comparator
    input wire ADC_start,
    input wire Reset,
    input wire comp_result,
    output reg sample_en,
    output reg ADC_done,
    output reg [7:0] ADC_data,   // 8-bit result
    output reg [7:0] dac_code    // DAC control for next comparison
);

    // State encoding
    parameter IDLE = 2'b00;
    parameter SAMPLE_INIT = 2'b01;
    parameter CONVERT = 2'b10;

    reg [1:0] current_state;
    reg [2:0] bit_index;
    reg [7:0] sar_reg;          // SAR register for binary search

    // State machine implementation using comparator clock
    always @(posedge clk_comp or posedge Reset) begin
        if (Reset) begin
            current_state <= IDLE;
            ADC_done <= 0;
            sample_en <= 0;
            ADC_data <= 8'h00;
            dac_code <= 8'h00;
            sar_reg <= 8'h00;
            bit_index <= 0;
        end
        else begin
            case (current_state)
                IDLE: begin
                    ADC_done <= 0;
                    sample_en <= 0;
                    if (ADC_start) begin
                        current_state <= SAMPLE_INIT;
                        sample_en <= 1;
                        sar_reg <= 8'h80;   // Set MSB to 1
                        dac_code <= 8'h80;  // DAC output MSB
                        bit_index <= 7;     // Start from MSB
                        ADC_data <= 8'h00;
                    end
                end

                SAMPLE_INIT: begin
                    sample_en <= 0;         // Turn off sampling
                    current_state <= CONVERT;
                end

                CONVERT: begin
                    // SAR algorithm: keep bit if comp_result=1, clear if comp_result=0
                    if (comp_result) begin
                        ADC_data[bit_index] <= 1;  // Keep the bit
                    end else begin
                        sar_reg[bit_index] <= 0;    // Clear the bit
                    end
                    
                    if (bit_index > 0) begin
                        bit_index <= bit_index - 1;
                        // Set next bit to test
                        sar_reg[bit_index-1] <= 1;
                        dac_code <= sar_reg | (1 << (bit_index-1));
                    end
                    else begin
                        ADC_done <= 1;
                        current_state <= IDLE;
                    end
                end

                default: current_state <= IDLE;
            endcase
        end
    end

endmodule